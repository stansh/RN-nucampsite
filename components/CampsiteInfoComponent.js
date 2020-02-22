import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList,
    Modal, Button, StyleSheet,
    Alert, PanResponder } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        campsites: state.campsites,
        comments: state.comments,
        favorites: state.favorites
    };
};

const mapDispatchToProps = {
    postFavorite: campsiteId => postFavorite(campsiteId),
    postComment: (campsiteId, rating, author, text) => postComment(campsiteId, rating, author, text)

};


/* markFavorite(campsiteId) {
    this.props.postFavorite(campsiteId);
}
 */



 // RENDER COMMENTS COMPONENT

function RenderComments({comments}) {

    const renderCommentItem = ({item}) => {
        return (
            <View style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.text}</Text>
                <Rating
                    readonly
                    startingValue = {item.rating}
                    imageSize = {10}
                    style={{ alignItems: "flex-start", paddingVertical: "5%" }}
                   
                 />
                {/* <Text style={{fontSize: 12}}>{item.rating} Stars</Text> */}
                <Text style={{fontSize: 12}}>{`-- ${item.author}, ${item.date}`}</Text>
            </View>
        );
    };

    return (
        <Animatable.View animation='fadeInUp' duration={2000} delay={1000}>
            <Card>
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()}
                />
          </Card>
        </Animatable.View>
    );
}



// RENDER CAMPSITE COMPONENT

function RenderCampsite(props) {

    

    const {campsite} = props;

    const view = React.createRef();

    const recognizeDrag = ({dx}) => (dx < -200) ? true : false;

    const recognizeComment = ({dx}) => (dx < 200) ? true : false;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,

        onPanResponderGrant: () => {
            view.current.rubberBand(1000)
            .then(endState => console.log(endState.finished ? 'finished' : 'canceled'));
        },

        onPanResponderEnd: (e, gestureState) => {
            console.log('pan responder end', gestureState);
            if (recognizeDrag(gestureState)) {
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + campsite.name + ' to favorites?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => console.log('Cancel Pressed')
                        },
                        {
                            text: 'OK',
                            onPress: () => props.favorite ?
                                console.log('Already set as a favorite') : props.markFavorite()
                        }
                    ],
                    { cancelable: false }
                );
            } else if (recognizeComment(gestureState)) {
                props.onShowModal();
            }
            return true;
        }
    });

    if (campsite) {
        return (
            <Animatable.View
                animation='fadeInDown'
                duration={2000}
                delay={1000}
                ref={view}
                {...panResponder.panHandlers}>
                <Card
                    featuredTitle={campsite.name}
                    image={{uri: baseUrl + campsite.image}}>
                    <Text style={{margin: 10}}>
                        {campsite.description}
                    </Text>
                    <View style={styles.cardRow}>
                        <Icon
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            raised
                            reverse
                            onPress={() => props.favorite ? 
                                console.log('Already set as a favorite') : props.markFavorite()}
                        />
                        {/* pencil icon */}
                        <Icon style={styles.cardItem}
                            name='pencil'
                            type='font-awesome'
                            color='#5637DD'
                            raised
                            reverse
                            onPress={() => props.onShowModal()} 
                                /* console.log('Already set as a favorite') : props.markFavorite()} */
                        />
                    </View>
              </Card>
            </Animatable.View>
        );
    }
    return <View />;
}


// CAMPSITE INFO COMPONENT

class CampsiteInfo extends Component {
    
    
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            rating: 0,
            author:'',
            text:'',
        };
    }
    
    

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    handleComment(campsiteId) {
        this.toggleModal();
        this.props.postComment(
            campsiteId,
            this.state.rating,
            this.state.author,
            this.state.text //???
          );
    }
        // console.log(JSON.stringify(this.state));
        // this.props.postComment(this.props.campsiteId,rating, author, text );
       
    

    resetForm() {
        this.setState({
            rating: 0,
            author:'',
            text: ''
        });
    }
        
    markFavorite(campsiteId) {
        this.props.postFavorite(campsiteId);
    }

    static navigationOptions = {
        title: 'Campsite Information'
    };
    
  

    render() {
        
        const campsiteId = this.props.navigation.getParam('campsiteId');
        const campsite = this.props.campsites.campsites.filter(campsite => campsite.id === campsiteId)[0];
        const comments = this.props.comments.comments.filter(comment => comment.campsiteId === campsiteId);
        return (
            <ScrollView>
                <RenderCampsite campsite={campsite}
                    favorite={this.props.favorites.includes(campsiteId)}
                    markFavorite={() => this.markFavorite(campsiteId)}
                    onShowModal={() => this.toggleModal()}
                />
                <RenderComments 
                     comments={comments} 
                    
                     
                     
                />
                
                {/* comments modal */}
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onRequestClose={() => this.toggleModal()}>
                    <View style={styles.modal}>
                        <Rating 
                            showRating
                            startingValue={0}
                            imageSize= {40}
                            onFinishRating={(rating)=>this.setState({rating: rating})}
                            style={{paddingVertical: 10}}
                        />
                        <Input
                            placeholder =' Your Name'
                            leftIcon = {{type:'font-awesome',name:'user-o'}}
                            leftIconContainerStyle = {{paddinRight:10}}
                            onChangeText = {(author)=>this.setState({author: author})}
                            value = {this.state.author}
                        />
                        <Input
                            placeholder = ' Your Comment'
                            leftIcon = {{type:'font-awesome',name:'comment-o'}}
                            leftIconContainerStyle = {{paddinRight:10}}
                            onChangeText = {(text)=>this.setState({text: text})}
                            value  = {this.state.text}
                        />
                        <View style={{margin: 10}}>
                            
                            <Button
                                /* onPress={() => {
                                    this.toggleModal()                                
                                }} */
                                onPress={()=>{
                                    this.handleComment(campsiteId);
                                    this.resetForm();
                                }}
                                color='#5637DD'
                                title='Submit'
                            />
                            
                        </View >

                        <View style={{margin: 10}}>
                            
                            <Button
                                onPress={() => {
                                    this.toggleModal();
                                    this.resetForm();                               
                                }}
                                color='#808080'
                                title='Close'
                            />
                            
                        </View >

                        {/* <Text style={styles.modalTitle}>Search Campsite Reservations</Text>
                        <Text style={styles.modalText}>Number of Campers: {this.state.campers}</Text>
                        <Text style={styles.modalText}>Hike-In?: {this.state.hikeIn ? 'Yes' : 'No'}</Text>
                        <Text style={styles.modalText}>Date: {this.state.date}</Text>
                        <Button
                            onPress={() => {
                                this.toggleModal();
                                this.resetForm();
                            }}
                            color='#5637DD'
                            title='Close'
                        /> */}
                        
                    </View>
                </Modal>
            </ScrollView>  
        );
    }
}



// STYLES

const styles = StyleSheet.create({
   
       cardRow:{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
       },
       cardItem:{     
        flex: 1,  
        margin: 20
       },
       modal: {
        justifyContent:'center',
        margin:20
       }   
});


export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);