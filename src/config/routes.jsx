import Login from "../components/user/login";
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Clients from '../components/admin/client/Clients';
import Users from '../components/admin/users/Users';
import Usecases from '../components/admin/usecase/Usecases';
import Settings from "../components/user/settings/Settings";
import Profile from "../components/user/profile/Profile";
// import AmiHardning from "../pages/UseCases/AWS/Module/AmiHardning";
import StandardControl from "../components/admin/standardControl/standardControls";
import AddModule from "../components/dynModule/AddModule";
import FormComponent from "../components/dynModule/viewModule1";





const routes = [{
    path: '/login',
    component: Login,
    isPrivate: false
}, {
    path: '/home',
    component: Home,
    isPrivate: true
}, {
    path: '/about',
    component: About,
    isPrivate: true
}, {
    path: '/contact',
    component: Contact,
    isPrivate: true
}, {
    path: '/clients',
    component: Clients,
    isPrivate: true,
    roles: ['ADMIN']
}, {
    path: '/users',
    component: Users,
    isPrivate: true,
    roles: ['ADMIN']
}, {
    path: '/usecases',
    component: Usecases,
    isPrivate: true,
    roles: ['ADMIN']
}, {
    path: '/enterpriseStandard',
    component: StandardControl,
    isPrivate: true,
    roles: ['ADMIN']
},
{
    path: '/addModule',
    component: AddModule,
    isPrivate: true,
    //roles: ['ADMIN']
},
// {
//     path: '/viewModules',
//     component: FormComponent,
//     isPrivate: true,
//     roles: ['ADMIN']
// },

{
    path: '/viewModule1',
    component: FormComponent,
    isPrivate: true,
    roles: ['ADMIN']
},

 {
    path: '/user/settings',
    component: Settings,
    isPrivate: true
}, {
    path: '/user/profile',
    component: Profile,
    isPrivate: true
}, 
// {
//     path: '/AmiHardning',
//     component: AmiHardning,
//     isPrivate: true,
//     roles: ['ADMIN']
// },

];

export default routes;