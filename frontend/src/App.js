import React, { Component } from 'react';
import Sessions from './components/sessions';
import ReactGA from 'react-ga';

class App extends Component {
  state = {
    sessions: []
  }

  componentDidMount() {
    ReactGA.initialize("UA-60330160-3");
    fetch('https://api.kubeconvibes.com')
      .then(res => res.json())
      .then((data) => {
        this.setState({ sessions: data.sessions.sort((a,b)=>{
             return parseInt(b.views) - parseInt(a.views);
          }) })
      })
    .catch(console.log)
  }

  render() {
    return (
      <div>
        <nav class="navbar fixed-top navbar-expand-md navbar-dark bg-primary mb-3">
           <div class="flex-row d-flex">
             <h3 class="navbar-brand" href="#">KubeCon Vibes</h3>
           </div>
        </nav>
        <div class="container-fluid" id="main">
          <div class="row row-offcanvas row-offcanvas-left">
            <div class="col-md-3 col-lg-2 sidebar-offcanvas bg-light pl-0" id="sidebar" role="navigation">
              <ul class="nav flex-column sticky-top pl-0 pt-5 mt-3">
                <li class="nav-item"><a class="nav-link" href="https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/?">KubeCon EU 2020</a></li>
              </ul>
            </div>
            <div class="col main pt-5 mt-3">
              <h1 class="display-4 d-none d-sm-block">Sessions By Popularity</h1>
              <div class="row mb-3">
                <Sessions sessions={this.state.sessions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
