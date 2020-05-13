import React from "react";
import { View, Text, StyleSheet, Button, Image } from "react-native";
import Fire from "../Fire";
import firebase from 'firebase';

export default class ProfileScreen extends React.Component {
    state = {        
        
        user: {},
       
    };

    unsubscribe = null;

    componentDidMount() {
        const { email, photoURL} = firebase.auth().currentUser;

        this.setState({ email, photoURL });
        const user = this.props.uid || Fire.shared.uid;
        
        this.unsubscribe = Fire.shared.firestore
            .collection("users")
            .doc(user)
            .onSnapshot(doc => {
                this.setState({ user: doc.data() });
            }); 
             
        

    }
    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ marginTop: 64, alignItems: "center" }}>
                    <View style={styles.avatarContainer}>
                    <Image style={styles.avatar} source={this.state.photoURL ? {uri: this.state.photoURL} : 
                                                    require("../assets/profile.jpg")  } />
                    </View>
                    <Text style={styles.name}>{this.state.email}</Text>
                </View>
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>21</Text>
                        <Text style={styles.statTitle}>Posts</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>981</Text>
                        <Text style={styles.statTitle}>Followers</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>63</Text>
                        <Text style={styles.statTitle}>Following</Text>
                    </View>
                </View>

                <Button
                    onPress={() => {
                        Fire.shared.signOut();
                    }}
                    title="Log out"
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#9FE3A9',
    },
    profile: {
        marginTop: 64,
        alignItems: "center",
        backgroundColor: '#D2B737',
    },
    avatarContainer: {
        shadowColor: "#D2B737",
        shadowRadius: 30,
        shadowOpacity: 0.4,
        
    },
    avatar: {
        width: 136,
        height: 136,
        borderRadius: 68
    },
    name: {
        marginTop: 24,
        fontSize: 16,
        fontWeight: "600"
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        margin: 32,
        backgroundColor: '#D2B737',
    },
    stat: {
        alignItems: "center",
        flex: 1
    },
    statAmount: {
        color: "#4F566D",
        fontSize: 18,
        fontWeight: "300"
    },
    statTitle: {
        color: "#C3C5CD",
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4
    }
});
