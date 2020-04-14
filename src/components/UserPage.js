import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,
        Alert,Nav,Navbar,Card,Modal,Collapse,Spinner,ListGroup} from 'react-bootstrap';
//import * as Box from '3box';
import {withRouter} from 'react-router-dom';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';
import PrivateChat from './PrivateChat.js'

const Box = require('3box');

const Config = require('../config.js');
const AppName = Config.AppName
const usersRegistered = Config.usersRegistered
const admin = Config.admin



class UserPage extends Component {
  state = {
    confidentialThreadName: null,
    threadAdmin: null,
    items: null,
    space: null,
    coinbase: null,
  }
  constructor(props){
    super(props);
    this.addContact = this.addContact.bind(this);
    this.setItems = this.setItems.bind(this);
    this.setChannel = this.setChannel.bind(this);
  }
  componentDidMount = async function(){
    console.log(this.props);
    await this.setState({
      user_address: this.props.match.params.addr
    })
    await this.setItems();
    if(this.props.box){
      await this.setState({
        box: this.props.box,
        space: this.props.space,
        coinbase: this.props.coinbase
      });
      await this.setChannel();
    }

  }
  setChannel = async function(){

    await this.state.space.syncDone;
    const space = this.state.space;
    console.log("contacts_"+this.state.user_address)
    console.log(this.state.coinbase)
    const isContact = await space.private.get("contact_"+this.state.user_address);
    console.log(isContact);
    if(!isContact){
      const thread = await space.joinThread("contacts_"+this.state.user_address,{firstModerator:this.state.user_address});
      const postId = await thread.post(this.state.coinbase);
      await space.private.set("contact_"+this.state.user_address,postId);
    }
    const userProfile = await Box.getSpace(this.state.user_address,AppName);
    const threadAddressByUser = userProfile['contactThread_'+this.state.coinbase];
    console.log(threadAddressByUser);
    if(threadAddressByUser){
      const confidentialThreadNameByUser = "contact_"+this.state.user_address+"_"+this.state.coinbase;
      await space.public.set('contactThread_'+this.state.user_address,threadAddressByUser);
      const thread = await space.joinThreadByAddress(threadAddressByUser)
      //console.log(await thread.getPosts());
      await space.syncDone;
      await this.setState({
        confidentialThreadName: confidentialThreadNameByUser,
        threadAdmin: this.state.user_address,
        threadAddress: thread.address
      });
    } else {
      const confidentialThreadName = "contact_"+this.state.coinbase+"_"+this.state.user_address;
      let threadAddress = await space.public.get('contactThread_'+this.state.user_address);
      console.log(threadAddress)
      if(!threadAddress){
        const thread = await space.createConfidentialThread(confidentialThreadName);
        //const thread = await space.joinThread(confidentialThreadName,{firstModerator:this.state.coinbase,members: true});
        const members = await thread.listMembers();

        if(members.length == 0){
          await thread.addMember(this.state.user_address);
          console.log("member added");
        }
        threadAddress = thread.address

        await space.public.set('contactThread_'+this.state.user_address,threadAddress);

      }


      await this.setState({
        confidentialThreadName: confidentialThreadName,
        threadAdmin: this.state.coinbase,
        threadAddress: threadAddress
      });
    }
    return
  }
  setItems = async function(){
    let profile = this.state.profile;
    if(!profile){
      profile = await Box.getSpace(this.state.user_address,AppName);
    }
    await this.setState({
      profile: profile
    });
    const posts = await Box.getThread(AppName,"items_"+this.state.user_address,this.state.user_address,true);
    await this.setState({
      items: posts
    });
    return
  }
  addContact = async function(){
    const space = await this.state.space;
    await space.syncDone;
    console.log("contacts_"+this.state.user_address)

    const isContactAdded = await space.private.get("contactAdded_"+this.state.user_address);
    console.log(isContactAdded)
    console.log("contactsAdded_"+this.state.coinbase);
    if(!isContactAdded){
      const thread = await space.joinThread("contactsAdded_"+this.states.coinbase,{firstModerator:this.state.coinbase});
      const postId = await thread.post(this.state.user_address);
      await space.private.set("contactAdded_"+this.state.user_address,postId);
      alert('saved')
    } else {
      alert('contact already saved')
    }
    await space.syncDone;
    return
  }

  render(){
    const that = this;
    if(this.state.profile && this.state.items){
      const profile = this.state.profile
      console.log(this.state);
      const items = this.state.items
      const socialProfiles = [];

      if(profile.pinterest){
        socialProfiles.push({
          name: "Pinterest",
          profile: profile.pinterest.replace(/.*pinterest.com/,'').replace('/','').replace('/',''),
          uri: profile.pinterest
        })
      }


      if(this.state.confidentialThreadName){



        return(
          <div>
                <Tabs defaultActiveKey="portfolio" className="nav-fill flex-column flex-md-row">
                  <Tab eventKey="portfolio" title="Portfolio" style={{paddingTop:'10px'}}>
                    <div>
                      <div style={{paddingTop:'20px'}}>
                        <ProfileHover
                          address={profile.address}
                          orientation="bottom"
                          noCoverImg
                        />
                      </div>
                      <div style={{paddingTop:'40px'}}>
                        <h5>Decentralized portfolio profile</h5>
                        <p>Name: {profile.name}</p>
                        <p>Description: {profile.description}</p>
                        <p>Techs: {profile.techs}</p>
                        {
                          socialProfiles.map(function(item){
                            return(
                              <p>{item.name}: <a href={item.uri} href='_blank'>{item.profile}</a></p>
                            )
                          })
                        }
                      </div>
                      <div style={{paddingTop:'40px'}}>
                        <h5>Portfolio</h5>
                      </div>
                      <div style={{paddingTop:'20px'}}>


                      <h5>Education</h5>
                      <ListGroup>
                      {

                        this.state.items.map(function(post){
                          const item = post.message;
                          const postId = post.postId;
                          if(item.type === 0){
                            return(
                              <ListGroup.Item>
                                <Row>
                                  <Col lg={4}>
                                    <h5>{item.school_name}</h5>
                                    <h6>{item.course}</h6>
                                    <p><small>From {item.start_date} to {item.end_date}</small></p>
                                    <p><a href={item.uri} target="_blank">{item.uri}</a></p>
                                  </Col>
                                  <Col lg={8}>
                                    <p>{item.description}</p>
                                  </Col>
                                </Row>

                              </ListGroup.Item>
                            )
                          }

                        })
                      }
                      </ListGroup>
                      <h5>Projects</h5>
                      <ListGroup>
                      {
                        this.state.items.map(function(post){
                          const item = post.message;
                          const postId = post.postId;
                          if(item.type === 1){
                            return(
                              <ListGroup.Item>
                                <Row>
                                  <Col lg={4}>
                                    <h5>{item.title}</h5>
                                    <p><small>From {item.start_date} to {item.end_date}</small></p>
                                    <p><a href={item.uri} target="_blank">{item.uri}</a></p>
                                  </Col>
                                  <Col lg={8}>
                                    <p>{item.description}</p>
                                  </Col>
                                </Row>
                              </ListGroup.Item>
                            )
                          }

                        })
                      }
                      </ListGroup>
                      <h5>Experience</h5>
                      <ListGroup>
                      {
                        this.state.items.map(function(post){
                          const item = post.message;
                          const postId = post.postId;
                          if(item.type === 2){
                            return(
                              <ListGroup.Item>
                                <Row>
                                  <Col lg={4}>
                                    <h5>{item.company}</h5>
                                    <h6>{item.title}</h6>
                                    <p><small>From {item.start_date} to {item.end_date}</small></p>
                                    <p><small>{item.location}</small></p>
                                  </Col>
                                  <Col lg={8}>
                                    <p>{item.description}</p>
                                  </Col>
                                </Row>
                              </ListGroup.Item>
                            )
                          }

                        })
                      }
                      </ListGroup>
                      <h5>Publications</h5>
                      <ListGroup>
                      {
                        this.state.items.map(function(post){
                          const item = post.message;
                          const postId = post.postId;
                          if(item.type === 3){
                            return(
                              <ListGroup.Item>
                                <Row>
                                  <Col lg={4}>
                                    <h5>{item.name}</h5>
                                    <p><small>Published on {item.date}</small></p>
                                    <p><small><a href={item.uri} target='_blank'>{item.uri}</a></small></p>
                                  </Col>
                                  <Col lg={8}>
                                    <p>{item.description}</p>
                                  </Col>
                                </Row>
                              </ListGroup.Item>
                            )
                          }

                        })
                      }
                      </ListGroup>
                      </div>
                      <div>
                        <Button variant="primary" onClick={this.addContact}>Add contact</Button>
                      </div>
                     </div>
                    </Tab>
                    <Tab eventKey="privMessage" title="Private message" style={{paddingTop:'10px'}}>
                      <h5>Private message</h5>
                      <PrivateChat threadAddress={this.state.threadAddress} space={this.state.space} coinbase={this.state.coinbase} />


                  </Tab>
                  <Tab eventKey="comments" title="Comments" style={{paddingTop:'10px'}}>
                    <h5>Comments</h5>

                    <ThreeBoxComments
                                          // required
                                          spaceName={AppName}
                                          threadName={"job_offers_"+profile.address}
                                          adminEthAddr={profile.address}


                                          // Required props for context A) & B)
                                          box={this.props.box}
                                          currentUserAddr={this.props.coinbase}

                                          // Required prop for context B)
                                          //loginFunction={handleLogin}

                                          // Required prop for context C)
                                          //ethereum={ethereum}

                                          // optional
                                          members={false}
                    />



                  </Tab>
                </Tabs>
          </div>
        )
      }
      return(
        <div>
          <div style={{paddingTop:'20px'}}>
            <ProfileHover
              address={profile.address}
              orientation="bottom"
              noCoverImg
            />
          </div>
          <div style={{paddingTop:'40px'}}>
            <h5>Decentralized portfolio profile</h5>
            <p>Name: {profile.name}</p>
            <p>Description: {profile.description}</p>
            <p>Techs: {profile.techs}</p>
            {
              socialProfiles.map(function(item){
                return(
                  <p>{item.name}: <a href={item.uri} href='_blank'>{item.profile}</a></p>
                )
              })
            }
          </div>
          <div style={{paddingTop:'40px'}}>
            <h5>Portfolio</h5>
          </div>
          <div style={{paddingTop:'20px'}}>


          <h5>Education</h5>
          <ListGroup>
          {

            this.state.items.map(function(post){
              const item = post.message;
              const postId = post.postId;
              if(item.type === 0){
                return(
                  <ListGroup.Item>
                    <Row>
                      <Col lg={4}>
                        <h5>{item.school_name}</h5>
                        <h6>{item.course}</h6>
                        <p><small>From {item.start_date} to {item.end_date}</small></p>
                        <p><a href={item.uri} target="_blank">{item.uri}</a></p>
                      </Col>
                      <Col lg={8}>
                        <p>{item.description}</p>
                      </Col>
                    </Row>

                  </ListGroup.Item>
                )
              }

            })
          }
          </ListGroup>
          <h5>Projects</h5>
          <ListGroup>
          {
            this.state.items.map(function(post){
              const item = post.message;
              const postId = post.postId;
              if(item.type === 1){
                return(
                  <ListGroup.Item>
                    <Row>
                      <Col lg={4}>
                        <h5>{item.title}</h5>
                        <p><small>From {item.start_date} to {item.end_date}</small></p>
                        <p><a href={item.uri} target="_blank">{item.uri}</a></p>
                      </Col>
                      <Col lg={8}>
                        <p>{item.description}</p>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )
              }

            })
          }
          </ListGroup>
          <h5>Experience</h5>
          <ListGroup>
          {
            this.state.items.map(function(post){
              const item = post.message;
              const postId = post.postId;
              if(item.type === 2){
                return(
                  <ListGroup.Item>
                    <Row>
                      <Col lg={4}>
                        <h5>{item.company}</h5>
                        <h6>{item.title}</h6>
                        <p><small>From {item.start_date} to {item.end_date}</small></p>
                        <p><small>{item.location}</small></p>
                      </Col>
                      <Col lg={8}>
                        <p>{item.description}</p>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )
              }

            })
          }
          </ListGroup>
          <h5>Publications</h5>
          <ListGroup>
          {
            this.state.items.map(function(post){
              const item = post.message;
              const postId = post.postId;
              if(item.type === 3){
                return(
                  <ListGroup.Item>
                    <Row>
                      <Col lg={4}>
                        <h5>{item.name}</h5>
                        <p><small>Published on {item.date}</small></p>
                        <p><small><a href={item.uri} target='_blank'>{item.uri}</a></small></p>
                      </Col>
                      <Col lg={8}>
                        <p>{item.description}</p>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )
              }

            })
          }
          </ListGroup>
          <h5>Images</h5>
          <Row>
          {
            this.state.items.map(function(post){
              const item = post.message;
              const postId = post.postId;
              if(item.type === 4){
                return(
                  <Col
                    lg={4}
                    style={{
                      display:'flex',
                      flexDirection:'column',
                      justifyContent:'space-between',
                      paddingBottom: '100px'
                    }}>
                    <Card>
                      <Card.Body>
                        <center>
                          <img src={item.uri} caption={item.description} style={{width:'100%'}}/>
                        </center>
                      </Card.Body>
                    </Card>
                  </Col>
                )
              }

            })
          }
          </Row>
          </div>
         </div>
      )
    }
    return(
      <center>
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
        <p>Loading ...</p>
      </center>
    )
  }
}

export default withRouter(UserPage);
