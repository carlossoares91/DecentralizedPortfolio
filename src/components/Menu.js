import React,{Component} from 'react';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,Alert,Nav,Navbar,Card,Modal,Collapse} from 'react-bootstrap';
import {Link} from 'react-router-dom';
class Menu extends Component {
  state = {
    box: null,
    space: null,
    hasWeb3: null,
    isLoggedIn: null
  }

  constructor(props){
    super(props)
    this.setLoginItem = this.setLoginItem.bind(this);
  }
  componentDidMount = function(){
    this.setState({
      box: this.props.box,
      space: this.props.space,
      hasWeb3: this.props.hasWeb3,
      doingLogin: this.props.doingLogin
    })
  }

  setLoginItem = function(){
    if(!this.state.hasWeb3){
      return(
        <Nav.Link><Link to="/loginNoWeb3" style={{all: 'unset'}}>Login</Link></Nav.Link>
      )
    }
    return(
      <Nav.Link><Link to="/login" style={{all: 'unset'}}>Login</Link></Nav.Link>
    )
  }

  render(){
    if(!this.state.box){
      return(
        <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark">
          <Navbar.Brand><Link to="/home" style={{all: 'unset'}}>Decentralized Portfolio</Link></Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link><Link to="/home" style={{all: 'unset'}}>Home</Link></Nav.Link>
              <Nav.Link><Link to="/users" style={{all: 'unset'}}>Users</Link></Nav.Link>
              <Nav.Link><Link to="/jobs" style={{all: 'unset'}}>Jobs</Link></Nav.Link>
              <Nav.Link><Link to="/comments" style={{all: 'unset'}}>Comments</Link></Nav.Link>
              {
                this.setLoginItem()
              }
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      );
    }

    return(
      <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark">
        <Navbar.Brand><Link to="/home" style={{all: 'unset'}}>Decentralized Portfolio</Link></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link><Link to="/home" style={{all: 'unset'}}>Home</Link></Nav.Link>
            <Nav.Link><Link to="/profile" style={{all: 'unset'}}>Profile</Link></Nav.Link>
            <Nav.Link><Link to="/portfolio" style={{all: 'unset'}}>Portfolio</Link></Nav.Link>
            <Nav.Link><Link to="/users" style={{all: 'unset'}}>Users</Link></Nav.Link>
            <Nav.Link><Link to="/jobs" style={{all: 'unset'}}>Jobs</Link></Nav.Link>
            <Nav.Link><Link to="/comments" style={{all: 'unset'}}>Comments</Link></Nav.Link>
            <Nav.Link><Link to="/logout" style={{all: 'unset'}}>Logout</Link></Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}
export default Menu;
