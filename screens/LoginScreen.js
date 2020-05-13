import React from "react";
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, Image, StatusBar, LayoutAnimation } from "react-native";
import * as firebase from "firebase";
import { Ionicons } from "@expo/vector-icons";
import Fire from "../Fire";
import * as Google from "expo-google-app-auth";
require("firebase/firestore");

export default class LoginScreen extends React.Component {
    static navigationOptions = {
        headerShown: false
    };

    state = {
        user: {
            name: "name",
            email: "",
            avatar: null,
        },
        emaill: "",
        password: "",
        errorMessage: null
    };

    handleSignGoogle = () => {
        Fire.shared.createUserG(this.state.user);
        console.log(this.state.user);
    };
    handleLogin = () => {
        const { emaill, password } = this.state;

        firebase
            .auth()
            .signInWithEmailAndPassword(emaill, password)
            .catch(error => this.setState({ errorMessage: error.message }));
    };


    isUserEqual = (googleUser, firebaseUser) => {
        if (firebaseUser) {
            var providerData = firebaseUser.providerData;
            for (var i = 0; i < providerData.length; i++) {
                if (
                    providerData[i].providerId ===
                    firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                    providerData[i].uid === googleUser.getBasicProfile().getId()
                ) {
                    // We don't need to reauth the Firebase connection.
                    return true;
                }
            }
        }
        return false;
    };
    onSignIn = googleUser => {
        console.log('Google Auth Response', googleUser);

        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase.auth().onAuthStateChanged(
            function (firebaseUser) {
                unsubscribe();
                // Check if we are already signed-in Firebase with the correct user.
                if (!this.isUserEqual(googleUser, firebaseUser)) {
                    // Build Firebase credential with the Google ID token.
                    var credential = firebase.auth.GoogleAuthProvider.credential(
                        googleUser.idToken,
                        googleUser.accessToken
                    );
                    // Sign in with credential from the Google user.
                    firebase
                        .auth()
                        .signInAndRetrieveDataWithCredential(credential)
                        .then(function (result) {
                            console.log('user signed in ');
                            if (result.additionalUserInfo.isNewUser) {
                                firebase
                                    .database()
                                    .ref('/users/' + result.user.uid)
                                    .set({
                                        gmail: result.user.email,
                                        profile_picture: result.additionalUserInfo.profile.picture,
                                        first_name: result.additionalUserInfo.profile.given_name,
                                        last_name: result.additionalUserInfo.profile.family_name,
                                        created_at: Date.now()
                                    })
                                    .then(function (snapshot) {
                                        // console.log('Snapshot', snapshot);
                                    });
                            } else {
                                firebase
                                    .database()
                                    .ref('/users/' + result.user.uid)
                                    .update({
                                        last_logged_in: Date.now()
                                    });
                            }
                        })
                        .catch(function (error) {
                            // Handle Errors here.
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            // The email of the user's account used.
                            var email = error.email;
                            // The firebase.auth.AuthCredential type that was used.
                            var credential = error.credential;
                            // ...
                        });
                } else {
                    console.log('User already signed-in Firebase.');
                }
            }.bind(this)
        );
        this.handleSignGoogle();
    };
    signInWithGoogleAsync = async () => {

        try {
            const result = await Google.logInAsync({

                androidClientId: '783334567187-t40vininkqqikf26ckcnsfldss2ea19c.apps.googleusercontent.com',
                scopes: ['profile', 'email']
            });

            if (result.type === 'success') {
                this.setState({
                    user: {
                        name: result.user.name,
                        email: result.user.email,
                        avatar: result.user.photoUrl
                    }
                })

                this.onSignIn(result);
                console.log(this.state.user);
                return result.accessToken;
            } else {
                return { cancelled: true };
            }
        } catch (e) {
            return { error: true };
        }
    };

    render() {

        LayoutAnimation.easeInEaseOut();

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content"></StatusBar>
                <Image
                    source={require("../assets/authHeader.png")}
                    style={{ marginTop: -146, marginLeft: -50 }}
                ></Image>
                <Image
                    source={require("../assets/authFooter.png")}
                    style={{ position: "absolute", bottom: -150, right: -225 }}
                ></Image>
                <Image
                    source={require("../assets/loginLogo.png")}
                    style={{ marginTop: -250, alignSelf: "center" }}
                ></Image>

                <View style={styles.errorMessage}>
                    {this.state.errorMessage && <Text style={styles.error}>{this.state.errorMessage}</Text>}
                </View>

                <View style={styles.form}>
                    <View>
                        <Text style={styles.inputTitle}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            onChangeText={emaill => this.setState({ emaill })}
                            value={this.state.emaill}
                        ></TextInput>
                    </View>

                    <View style={{ marginTop: 12 }}>
                        <Text style={styles.inputTitle}>Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            autoCapitalize="none"
                            onChangeText={password => this.setState({ password })}
                            value={this.state.password}
                        ></TextInput>
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
                    <Text style={{ color: "#FFF", fontWeight: "500" }}>Sign in</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ alignSelf: "center", marginTop: 22 }}
                    onPress={() => this.props.navigation.navigate("Register")}
                >
                    <Text style={{ color: "#414959", fontSize: 13, marginBottom: 22 }}>
                        New to FoodSharing? <Text style={{ fontWeight: "500", color: "#E9446A" }}> Sign up</Text>
                    </Text>

                </TouchableOpacity>
                <TouchableOpacity>
                
                    <Button  
                        style={{ alignSelf: "center" }}                   
                        title="Sign In With Google"
                        onPress={() => this.signInWithGoogleAsync()}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    greeting: {
        marginTop: -95,
        fontSize: 18,
        fontWeight: "400",
        textAlign: "center"
    },
    form: {
        marginBottom: 18,
        marginHorizontal: 30
    },
    inputTitle: {
        color: "#8A8F9E",
        fontSize: 10,
        textTransform: "uppercase"
    },
    input: {
        borderBottomColor: "#8A8F9E",
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: "#161F3D"
    },
    button: {
        marginHorizontal: 30,
        backgroundColor: "#E9446A",
        borderRadius: 4,
        height: 52,
        alignItems: "center",
        justifyContent: "center"
    },
    errorMessage: {
        height: 72,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 30
    },
    error: {
        color: "#005C6A",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center"
    }
});
