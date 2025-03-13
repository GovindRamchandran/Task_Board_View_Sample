import { getFirestore } from "firebase/firestore";
import firebaseApp from "./firebaseConfig";
import { getAuth } from 'firebase/auth';

const db = getFirestore(firebaseApp);
export default db;
export const auth = getAuth(firebaseApp);