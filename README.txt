# Trash To Cast

เว็บไซต์สะสมแต้มจากการทิ้งขยะให้ถูกประเภท มี 4 หน้าหลัก:
1. หน้าแรก: ชื่อสมาชิก + ระดับชั้น/ห้อง + แต้มสะสม
2. ความรู้: ขยะทั่วไป/เปียก/รีไซเคิล/อันตราย
3. รางวัล: ดูแต้มและแลกรางวัล
4. บัญชี: ดูและแก้ไขข้อมูลสมาชิก

## การใช้งานแบบทดลอง
เปิด `index.html` ได้เลย ระบบมี Demo mode ให้ทดลองหน้าตาและเมนูโดยไม่ต้องตั้ง Firebase

## การใช้งานจริง
ต้องสร้าง Firebase Project และเปิด:
- Authentication > Email/Password
- Authentication > Facebook
- Firestore Database

จากนั้นนำ Firebase Web App config มาแทนค่าใน `app.js` ตัวแปร `firebaseConfig`

### Facebook Login
ต้องสร้าง Facebook App และนำ App ID/Secret ไปตั้งค่าที่ Firebase Authentication > Facebook พร้อมกำหนด OAuth redirect domain ตามที่ Firebase แจ้ง

## QR Code
QR Code ที่แนบมาเป็นภาพสำหรับนำไปใช้เป็นทางเข้าระบบ แต่ QR จะต้องชี้ไปยัง URL ที่โฮสต์เว็บไซต์จริง เช่นโดเมนของโรงเรียน/โฮสต์ที่คุณใช้
