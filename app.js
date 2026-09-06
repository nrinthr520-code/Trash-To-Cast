/*
  Trash To Cast
  1) Create a Firebase project.
  2) Enable Authentication > Email/Password and Facebook.
  3) Enable Firestore Database.
  4) Replace firebaseConfig below with your Firebase Web App config.
*/

const firebaseConfig = {
  apiKey: "ใส่_API_KEY",
  authDomain: "ใส่_PROJECT_ID.firebaseapp.com",
  projectId: "ใส่_PROJECT_ID",
  storageBucket: "ใส่_PROJECT_ID.appspot.com",
  messagingSenderId: "ใส่_MESSAGING_SENDER_ID",
  appId: "ใส่_APP_ID"
};

let auth = null, db = null, firebaseReady = false;

try {
  if (!firebaseConfig.apiKey.includes("ใส่_")) {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    firebaseReady = true;
    auth.onAuthStateChanged(handleAuth);
  }
} catch (e) {
  console.error(e);
}

const $ = id => document.getElementById(id);
const toast = msg => {
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2200);
};

let currentUser = null;
let profile = JSON.parse(localStorage.getItem("ttc_profile") || "null");
let points = Number(localStorage.getItem("ttc_points") || 0);

function show(id) {
  ["authScreen","profileScreen","appScreen"].forEach(x => $(x).classList.add("hidden"));
  $(id).classList.remove("hidden");
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  $(pageId).classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.page === pageId));
  window.scrollTo({top:0, behavior:"smooth"});
}

function updateUI() {
  if (!profile) return;
  $("welcomeName").textContent = profile.name || "สมาชิก";
  $("welcomeClass").textContent = `${profile.className || "-"} • ห้อง ${profile.room || "-"}`;
  $("homePoints").textContent = points;
  $("rewardPoints").textContent = points;
  $("accountName").value = profile.name || "";
  $("accountClass").value = profile.className || "ม.1";
  $("accountRoom").value = profile.room || "";
  $("accountEmail").value = currentUser?.email || profile.email || "";
}

async function handleAuth(user) {
  if (!user) {
    currentUser = null;
    show("authScreen");
    return;
  }
  currentUser = user;
  let saved = null;
  if (db) {
    const snap = await db.collection("users").doc(user.uid).get();
    if (snap.exists) saved = snap.data();
  }
  profile = saved || JSON.parse(localStorage.getItem("ttc_profile") || "null");
  if (!profile?.name || !profile?.className || !profile?.room) {
    $("profileName").value = user.displayName || "";
    show("profileScreen");
  } else {
    show("appScreen");
    updateUI();
    showPage("homePage");
  }
}

async function saveProfile() {
  const name = $("profileName").value.trim();
  const className = $("profileClass").value;
  const room = $("profileRoom").value.trim();
  if (!name || !className || !room) return toast("กรุณากรอกชื่อ ระดับชั้น และห้องให้ครบ");

  profile = {name, className, room, email: currentUser?.email || ""};
  localStorage.setItem("ttc_profile", JSON.stringify(profile));

  if (db && currentUser) {
    await db.collection("users").doc(currentUser.uid).set({
      ...profile, points: points, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, {merge:true});
  }
  show("appScreen");
  updateUI();
  showPage("homePage");
  toast("บันทึกข้อมูลเรียบร้อย");
}

async function loginEmail() {
  if (!firebaseReady) return toast("กรุณาใส่ Firebase config ใน app.js ก่อน");
  const email = $("email").value.trim(), password = $("password").value;
  if (!email || !password) return toast("กรุณากรอกอีเมลและรหัสผ่าน");
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (e) { toast(e.message.replace("Firebase: ","")); }
}

async function signupEmail() {
  if (!firebaseReady) return toast("กรุณาใส่ Firebase config ใน app.js ก่อน");
  const email = $("email").value.trim(), password = $("password").value;
  if (!email || password.length < 6) return toast("อีเมลต้องถูกต้อง และรหัสผ่านอย่างน้อย 6 ตัวอักษร");
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    toast("สมัครสมาชิกสำเร็จ");
  } catch (e) { toast(e.message.replace("Firebase: ","")); }
}

async function loginFacebook() {
  if (!firebaseReady) return toast("กรุณาใส่ Firebase config ใน app.js ก่อน");
  try {
    const provider = new firebase.auth.FacebookAuthProvider();
    await auth.signInWithPopup(provider);
  } catch (e) { toast(e.message.replace("Firebase: ","")); }
}

async function addPoints(amount) {
  points += amount;
  localStorage.setItem("ttc_points", points);
  if (db && currentUser) await db.collection("users").doc(currentUser.uid).set({points}, {merge:true});
  updateUI();
  toast(`ได้รับ +${amount} คะแนน`);
}

async function redeem(cost, name) {
  if (points < cost) return toast("แต้มยังไม่พอสำหรับรางวัลนี้");
  if (!confirm(`ต้องการใช้ ${cost} คะแนน แลก "${name}" หรือไม่?`)) return;
  points -= cost;
  localStorage.setItem("ttc_points", points);
  if (db && currentUser) await db.collection("users").doc(currentUser.uid).set({points}, {merge:true});
  updateUI();
  toast(`แลกรางวัล "${name}" สำเร็จ`);
}

async function updateAccount() {
  const next = {
    ...profile,
    name: $("accountName").value.trim(),
    className: $("accountClass").value,
    room: $("accountRoom").value.trim()
  };
  if (!next.name || !next.room) return toast("กรุณากรอกข้อมูลให้ครบ");
  profile = next;
  localStorage.setItem("ttc_profile", JSON.stringify(profile));
  if (db && currentUser) await db.collection("users").doc(currentUser.uid).set(profile, {merge:true});
  updateUI();
  toast("อัปเดตข้อมูลแล้ว");
}

document.addEventListener("click", e => {
  const page = e.target.closest("[data-page]");
  if (page) showPage(page.dataset.page);
});

$("emailLoginBtn").onclick = loginEmail;
$("emailSignupBtn").onclick = signupEmail;
$("facebookBtn").onclick = loginFacebook;
$("saveProfileBtn").onclick = saveProfile;
$("addPointBtn").onclick = () => addPoints(10);
$("updateAccountBtn").onclick = updateAccount;
$("logoutBtn").onclick = async () => {
  if (auth) await auth.signOut();
  profile = null; localStorage.removeItem("ttc_profile");
  show("authScreen");
};

document.querySelectorAll(".redeem").forEach(btn => {
  btn.onclick = () => redeem(Number(btn.dataset.cost), btn.dataset.name);
});

if (!firebaseReady) {
  // Demo mode: lets the UI be previewed without Firebase.
  $("emailLoginBtn").onclick = () => {
    currentUser = {email: $("email").value || "demo@example.com"};
    if (!profile) {
      $("profileName").value = "";
      show("profileScreen");
    } else {
      show("appScreen"); updateUI(); showPage("homePage");
    }
  };
  $("emailSignupBtn").onclick = () => {
    currentUser = {email: $("email").value || "demo@example.com"};
    show("profileScreen");
  };
  $("facebookBtn").onclick = () => {
    currentUser = {email: "facebook-demo@example.com"};
    show("profileScreen");
  };
}
