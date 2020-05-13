import React from "react";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import Fire from "../Fire";

import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, Animated, Dimensions, Easing } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const animationEndY = Math.ceil(height * 0.7);
const negativeEndY = animationEndY * -1;

let heartCount = 1;

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomColor() {
    return `rgb(${getRandomNumber(100, 144)}, ${getRandomNumber(10, 200)}, ${getRandomNumber(200, 244)})`;
}

export default class HomeScreen extends React.Component {

    state = {
        posts: [],
        hearts: []
    };

    unsubscribe = null;


    addHeart = () => {
        this.setState(
            {
                hearts: [
                    ...this.state.hearts,
                    {
                        id: heartCount,
                        right: getRandomNumber(20, 150),
                        color: getRandomColor()
                    }
                ]
            },
            () => {
                heartCount++;
            }
        );
    };

    removeHeart = id => {
        this.setState({
            hearts: this.state.hearts.filter(heart => {
                return heart.id !== id;
            })
        });
    };


    componentDidMount() {
        // const posts = this.props.uid || Fire.shared.uid;

        this.unsubscribe = Fire.shared.firestore

            .collection("posts")
            .get()
            .then(snapshot => {
                const posts = []
                snapshot.forEach(doc => {
                    const data = doc.data()
                    posts.push(data)
                })
                this.setState({ posts: posts })
                // console.log(snapshot)
            })
            .catch(error => console.log(error))
    }


    renderPost = post => {
        return (
            <View style={styles.feedItem}>

                <Image style={styles.avatar} source={this.state.photoURL ? {uri: this.state.photoURL} : 
                                                    require("../assets/profile-pic.jpg")  } />

                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                            <Text style={styles.name}>{post.name}</Text>
                            <Text style={styles.timestamp}>{moment(post.timestamp).fromNow()}</Text>
                        </View>



                        <Ionicons name="ios-more" size={24} color="#73788B" />
                    </View>
                    <Text style={styles.post}>{post.text}</Text>

                    <Image
                        source={
                            post.image
                                ? { uri: post.image }
                                : require("../assets/tempAvatar.jpg")
                        }
                        style={styles.postImage} resizeMode="cover"
                    />
                    <View style={styles.avatarContainer}></View>



                    <View style={{ flexDirection: "row" }}>
                        <View style={styles.container}>
                            {this.state.hearts.map(heart => {
                                return (
                                    <HeartContainer
                                        key={heart.id}
                                        style={{ right: heart.right }}
                                        onComplete={() => this.removeHeart(heart.id)}
                                        color={heart.color}
                                    />
                                );
                            })}
                        </View>
                        
                        <TouchableOpacity onPress={this.addHeart} style={styles.addButton}>
                            <AntDesign name="heart" size={20} color="#FFF" />
                        </TouchableOpacity>

                        <Ionicons name="ios-chatboxes" size={24} color="#73788B" />
                    </View>
                </View>
            </View>
        );
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Welcome to our FoodSharing Community!</Text>
                </View>
                <FlatList
                    style={styles.feed}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => this.renderPost(item)}
                    data={this.state.posts}
                    showsVerticalScrollIndicator={false}
                />

            </View>
        );
    }
}


class HeartContainer extends React.Component {
    constructor() {
        super();

        this.yAnimation = this.state.position.interpolate({
            inputRange: [negativeEndY, 0],
            outputRange: [animationEndY, 0]
        });

        this.opacityAnimation = this.yAnimation.interpolate({
            inputRange: [0, animationEndY],
            outputRange: [1, 0]
        });

        this.scaleAnimation = this.yAnimation.interpolate({
            inputRange: [0, 15, 30],
            outputRange: [0, 1.4, 1],
            extrapolate: "clamp"
        });

        this.xAnimation = this.yAnimation.interpolate({
            inputRange: [0, animationEndY / 6, animationEndY / 3, animationEndY / 2, animationEndY],
            outputRange: [0, 25, 15, 0, 10]
        });

        this.rotateAnimation = this.yAnimation.interpolate({
            inputRange: [0, animationEndY / 6, animationEndY / 3, animationEndY / 2, animationEndY],
            outputRange: ["0deg", "-5deg", "0deg", "5deg", "0deg"]
        });
    }

    state = {
        position: new Animated.Value(0)
    };

    static defaultProps = {
        onComplete() { }
    };

    componentDidMount() {
        Animated.timing(this.state.position, {
            duration: 2000,
            toValue: negativeEndY,
            easing: Easing.ease,
            useNativeDriver: true
        }).start(this.props.onComplete);
    }

    getHeartStyle() {
        return {
            transform: [
                { translateY: this.state.position },
                { scale: this.scaleAnimation },
                { translateX: this.xAnimation },
                { rotate: this.rotateAnimation }
            ],
            opacity: this.opacityAnimation
        };
    }

    render() {
        return (
            <Animated.View style={[styles.heartContainer, this.getHeartStyle(), this.props.style]}>
                <Heart color={this.props.color} />
            </Animated.View>
        );
    }
}

const Heart = props => (
    <View {...props} style={[styles.heart, props.style]}>
        <AntDesign name="heart" size={48} color={props.color} />
    </View>
);



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#C3F219"
    },
    header: {
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: "#E66060",
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#EBECF4",
        shadowColor: "#454D65",
        shadowOffset: { height: 5 },
        shadowRadius: 15,
        shadowOpacity: 0.2,
        zIndex: 10
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: "400",
        marginTop: 22,
        color: "#54006A",
    },
    feed: {
        marginHorizontal: 16
    },
    feedItem: {
        backgroundColor: "#FFDFDF",
        borderRadius: 5,
        padding: 8,
        flexDirection: "row",
        marginVertical: 8,
      
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16
    },
    name: {
        fontSize: 15,
        fontWeight: "500",
        color: "#060217"
    },
    timestamp: {
        fontSize: 11,
        color: "#060230",
        marginTop: 4
    },
    post: {
        marginTop: 16,
        fontSize: 14,
        color: "#838899"
    },
    postImage: {
        width: undefined,
        height: 150,
        borderRadius: 5,
        marginVertical: 16
    },

    addButton: {
        backgroundColor: "#378AD9",
        width: 50,
        height: 50,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: 32,
        left: 5
    },
    heartContainer: {
        position: "absolute",
        bottom: 30,
        backgroundColor: "transparent"
    },
    heart: {
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent"
    }














});
