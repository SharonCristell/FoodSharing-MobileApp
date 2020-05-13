import FirebaseKeys from "./config";
import React from 'react';
import firebase from "firebase";
import { GeoCollectionReference, GeoFirestore, GeoQuery, GeoQuerySnapshot } from 'geofirestore';
import geohash from "ngeohash";
require("firebase/firestore");

class Fire {
    constructor() {
        firebase.initializeApp(FirebaseKeys);
    }


    addPost = async ({ text, localUri }) => {
        const remoteUri = await this.uploadPhotoAsync(localUri, `photos/${this.uid}/${Date.now()}`);

        return new Promise((res, rej) => {
            this.firestore
                .collection("posts")
                .add({
                    text,
                    uid: this.uid,
                    timestamp: this.timestamp,
                    image: remoteUri
                })
                .then(ref => {
                    res(ref);
                })
                .catch(error => {
                    rej(error);
                });
        });
    };

    addLocation = async ({ lat, lng }) => {


        return new Promise((res, rej) => {
            this.firestore
                .collection("user-locations")
                .add({
                    uid: this.uid,
                    latitude: lat,
                    longitude: lng,
                    timestamp: this.timestamp
                })
                .then(ref => {
                    res(ref);
                })
                .catch(error => {
                    rej(error);
                });
        });
    };

    uploadPhotoAsync = (uri, filename) => {
        return new Promise(async (res, rej) => {
            const response = await fetch(uri);
            const file = await response.blob();

            let upload = firebase
                .storage()
                .ref(filename)
                .put(file);

            upload.on(
                "state_changed",
                snapshot => { },
                err => {
                    rej(err);
                },
                async () => {
                    const url = await upload.snapshot.ref.getDownloadURL();
                    res(url);
                }
            );
        });
    };

    createUser = async user => {
        let remoteUri = null;

        try {
            await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);

            let db = this.firestore.collection("users").doc(this.uid);

            db.set({
                name: user.name,
                email: user.email,
                avatar: null
            });

            if (user.avatar) {
                remoteUri = await this.uploadPhotoAsync(user.avatar, `avatars/${this.uid}`);

                db.set({ avatar: remoteUri }, { merge: true });
            }
        } catch (error) {
            alert("Error: ", "Formato de usuario incorrecto");
        }
    };

    createUserG = async user => {

        let remoteUri = user.avatar;
        


        return new Promise((res, rej) => {
            let db = this.firestore.collection("users");

                db.add({
                    name: user.name,
                    email: user.email,
                    avatar: remoteUri
                })
                .then(ref => {
                    res(ref);
                })
                .catch(error => {
                    rej(error);
                });
            

                if (user.avatar) {
                    remoteUri = this.uploadPhotoAsync(user.avatar, `avatars/${this.uid}`);

                    db.set({ avatar: remoteUri }, { merge: true });
                }
           
        })


    };




    signOut = () => {
        firebase.auth().signOut();
    };

    get firestore() {
        return firebase.firestore();
    }

    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }

    get timestamp() {
        return Date.now();
    }

    get users() {
        return this.users;
    }

    get firestoreauth() {
        return firebase.auth();
    }

}

Fire.shared = new Fire();
export default Fire;
