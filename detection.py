import cv2
import numpy as np
from tensorflow.keras.models import load_model # type: ignore
import base64

IMG_SIZE = 90
EYE_CLOSED_LABEL = 0
FRAME_THRESHOLD = 7

model = load_model("eye_model.h5")
face_cascade = cv2.CascadeClassifier("haarcascade/haarcascade_frontalface_alt.xml")
eye_cascade = cv2.CascadeClassifier("haarcascade/haarcascade_eye.xml")

closed_frame_count = 0  # Moved to module level

def process_frame(frame):
    global closed_frame_count

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    eye_closed_detected = False

    for (fx, fy, fw, fh) in faces:
        cv2.rectangle(frame, (fx, fy), (fx + fw, fy + fh), (255, 255, 0), 2)
        roi_gray = gray[fy:fy + fh, fx:fx + fw]
        roi_color = frame[fy:fy + fh, fx:fx + fw]

        eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 3, minSize=(30, 30))
        for (ex, ey, ew, eh) in eyes:
            eye = roi_gray[ey:ey + eh, ex:ex + ew]
            try:
                eye = cv2.resize(eye, (IMG_SIZE, IMG_SIZE))
                eye = eye.astype("float32") / 255.0
                eye = np.expand_dims(eye, axis=(0, -1))

                prediction = model.predict(eye, verbose=0)[0][0]
                label = 1 if prediction >= 0.5 else 0
                color = (0, 255, 0) if label == 1 else (0, 0, 255)
                status = "Open" if label == 1 else "Closed"

                if label == EYE_CLOSED_LABEL:
                    eye_closed_detected = True

                cv2.putText(roi_color, status, (ex, ey - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                cv2.rectangle(roi_color, (ex, ey), (ex + ew, ey + eh), color, 2)
            except:
                continue

    if eye_closed_detected:
        closed_frame_count += 1
    else:
        closed_frame_count = 0

    alarm_triggered = closed_frame_count >= FRAME_THRESHOLD

    _, jpeg = cv2.imencode('.jpg', frame)
    b64 = base64.b64encode(jpeg.tobytes()).decode('utf-8')

    return b64, alarm_triggered
