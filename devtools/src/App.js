import React from 'react'
import logo from './logo.svg'
import './App.css'
import Header from './shared/Header'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Globals from './pages/Globals'
import GeneratePage from './pages/Generate'
import List from './pages/routes/List'
import IndexPage from './pages/migrations/Index'
import MigrationsCreate from './pages/migrations/Create'
import Loader from './pages/Loader'
import Routing from './docs/getting_started/Routing'
import Templates from './docs/getting_started/Templates'
import Models from './docs/getting_started/Models'
import Why from './docs/getting_started/Why'
import ConfigList from './pages/ConfigList'
import ModelList from './pages/ModelList'
import LoggedRequests from './pages/LoggedRequests'
import DbQuery, { DbQueryPage } from './pages/DbQuery'

const DocRoutes = () => {
    return (
        <>
            <Route path="/getting_started/routing">
                <Routing />
            </Route>
            <Route path="/getting_started/templates">
                <Templates />
            </Route>
            <Route exact path="/getting_started/models">
                <Models />
            </Route>
            <Route path="/getting_started/why">
                <Why />
            </Route>
        </>
    )
}

function App() {
    return (
        <div className="App">
            <Router basename="/devtools">
                <Header />

                <Switch>
                    <Route path="/globals">
                        <Globals />
                    </Route>
                    <Route path="/requests">
                        <LoggedRequests />
                    </Route>
                    <Route path="/generate">
                        <GeneratePage />
                    </Route>
                    <Route path="/routes/list">
                        <List />
                    </Route>
                    <Route exact path="/migrations">
                        <IndexPage />
                    </Route>
                    <Route path="/migrations/create">
                        <MigrationsCreate />
                    </Route>
                    <Route path="/loader">
                        <Loader />
                    </Route>
                    <Route path="/models">
                        <ModelList />
                    </Route>
                    <Route path="/config">
                        <ConfigList />
                    </Route>
                    <Route path="/db_query">
                        <DbQueryPage />
                    </Route>

                    <DocRoutes />
                </Switch>
            </Router>
        </div>
    )
}

export default App
