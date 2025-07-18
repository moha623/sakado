import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root',
})
export class CoreService {
  constructor(private firestore: Firestore) {}
  async addFeedback(messageData: any) {
    try {
      const messageWithMetaData={
        ...messageData,
        createdAt: serverTimestamp(),
        status:'unread',
        read:false,

      }
      const messageRef=collection(this.firestore,'feedback');
      await addDoc(messageRef, messageWithMetaData);
      return true;

    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  }
}
