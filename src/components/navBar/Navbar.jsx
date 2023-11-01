import React, { useContext, useEffect, useRef } from "react";
import navlogo from "../../images/cac-cloud-logo.jpg";
import { NavLink, useHistory } from "react-router-dom";
import axios from "axios";
import settings from "../../settings.json";
import { ToasterContext, UserContext } from "../common/Context";
import useNavBar from "../../hooks/useNavBar";
import Logout from "../user/logout";
import NavBarSearch from "./NavBarSearch";


const { ip } = settings;

const Navbar = () => {
  const [navBar, setNavBar, clear] = useNavBar();
  const history = useHistory();
  const { user, setUser: setContextUser } = useContext(UserContext);
  const { addMessage } = useContext(ToasterContext);
  const hyperScalarMenus = [{ label: "HyperScalar" }];
  // const commonRoutesData = [
  //   // {
  //   //   name: "Pipeline",
  //   //   subMenu: [
  //   //     { name: "Infra pipeline", UIRoute: "/" },
  //   //     { name: "CI/CD Pipeline", UIRoute: "/" },
  //   //   ],
  //   // },
  // ];
  const adminRoutesData = [
    {
      name: "Admin",
      subMenu: [
        { name: "Clients", UIRoute: "/clients" },
        { name: "Users", UIRoute: "/users" },
        { name: "UseCases", UIRoute: "/usecases" },
        {
          name: "Enterprise Standards & Controls",
          UIRoute: "/enterpriseStandard",
        },

        // {
        //   name: "Operations", UIRoute: "/",
        //   subMenu: [
        //     { name: "AWS - Linux AMI Creation", UIRoute: "/AmiHardning" },
        //     { name: "AWS - Windows AMI Creation", UIRoute: "/Windowsami" },
        //   ],
        // },
      ],
    },
  ];

  const Addmodule = [
    {
      name: "Add Module", UIRoute: "/addModule"
    },
  ];

  // const NewModuleScreen = [
  //   {
  //     name: "Dyn Module",
  //     subMenu: [
       
  //       {
  //         name: "AddModule",
  //         UIRoute: "/addModule",
  //       },
  //       { name: "ViewModule",
  //        UIRoute: "/viewModules" 
  //       },

  //       // {
  //       //   name: "Operations", UIRoute: "/",
  //       //   subMenu: [
  //       //     { name: "AWS - Linux AMI Creation", UIRoute: "/AmiHardning" },
  //       //     { name: "AWS - Windows AMI Creation", UIRoute: "/Windowsami" },
  //       //   ],
  //       // },
  //     ],
  //   },
  // ];

  const setHyperScalar = (selectedHyperScalar) => {
    return (e) => {
      e.preventDefault();
      const { code, cloudId } = selectedHyperScalar;
      fetchUserMenuPermissions(cloudId);
      setNavBar({ selectedHyperScalar: code, cloudId });
    };
  };

  const logout = () => {
    axios
      .delete(`${ip}logout`)
      .then(() => {
        clear();
        setContextUser(null);
        localStorage.clear();
        history.push("/login");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const featchCloudProvides = () => {
    axios
      .get(`${ip}cloud`)
      .then(({ data }) => {
        setNavBar({ cloudProviders: data });
      })
      .catch((e) => {
        addMessage({
          severity: "error",
          summary: "Cloud Provides",
          detail: "Faield to fetch Cloud Providers list",
          sticky: true,
        });
      });
  };

  const fetchUserMenuPermissions = async (cloudId) => {
    const { userId } = user;
    try {
      const { data } = await axios.get(`${ip}user/menu/${userId}/${cloudId}`);
      const selectedHyperScalarMenu = prepareTreeFormat(data?.uuseCase);
      setNavBar({ selectedHyperScalarMenu });
    } catch (e) {
      addMessage({
        severity: "error",
        summary: "UseCase Menu",
        detail: `Failed to fetch UseCase Menu for user : ${user.name}`,
        sticky: true,
      });
    }
  };

  // const prepareTreeFormat = (data = []) => {
  //   return data
  //     .filter((f) => !f.parentId)
  //     .map((item) => {
  //       item.subMenu = getChildMenu(data, item.useCaseId);
  //       if (!item.subMenu.length) {
  //         delete item.subMenu;
  //       }
  //       return item;
  //     });
  // };

  const prepareTreeFormat = (data = []) => {
    return data
      .filter((f) => !f.parentId && (f.name === 'Add Modules' || f.name === 'View Module'))
      .map((item) => {
        item.subMenu = getChildMenu(data, item.useCaseId);
        if (!item.subMenu.length) {
          delete item.subMenu;
        }
        return item;
      });
  };


  

  // const prepareTreeFormat = (data = []) => {
  //   if (!data) {
  //     return []; // Return an empty array if data is null or undefined
  //   }
  
  //   const filteredData = data.filter(
  //     (f) =>
  //       (!f.parentId && f.useCase.UIRoute) || // Include root use cases with UIRoute
  //       (!f.parentId && !f.useCase.UIRoute) || // Include root use cases without UIRoute
  //       (f.useCase.name === 'Add Modules' || f.useCase.name === 'View Module') // Include "add module" and "view modules" use cases
  //   );
    
  //   return filteredData
  //     .map((item) => {
  //       item.subMenu = getChildMenu(filteredData, item.useCaseId);
  //       if (!item.subMenu.length) {
  //         delete item.subMenu;
  //       }
  //       return item;
  //     });
  // };


  const getChildMenu = (data = [], parentId) => {
    return data
      .filter((item) => {
        return item?.useCase?.useCaseId === parentId;
      })
      .map((item) => {
        item.subMenu = getChildMenu(data, item?.useCaseId);
        if (!item.subMenu.length) {
          delete item.subMenu;
        }
        return item;
      });
  };

  const renderSubMenu = (subMenu, level) => {
    return (
      <ul className={`${level > 1 ? "submenu " : ""} dropdown-menu`}>
        {subMenu?.map((menu, idx) => (
          <li key={level + idx}>
              {menu?.subMenu ? <NavLink
              className="dropdown-item drop-size"
              to="/"
              activeClassName="selected"
            >
              {menu.name}
            </NavLink> : <NavLink
              className="dropdown-item drop-size"
              to={menu.UIRoute}
              activeClassName="selected"
            >
              {menu.name}
            </NavLink>}
            
            
            {menu?.subMenu && renderSubMenu(menu?.subMenu, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  // const renderSubMenu = (subMenu, level) => {
  //   return (
  //     <ul className={`${level > 1 ? "submenu " : ""} dropdown-menu`}>
  //       {subMenu?.map((menu, idx) => (
  //         <li key={level + idx}>
  //           {menu?.subMenu ? (
  //             <NavLink
  //               className="dropdown-item drop-size"
  //               to="/"
  //               activeClassName="selected"
  //             >
  //               {menu.name}
  //             </NavLink>
  //           ) : (
  //             <NavLink
  //               className="dropdown-item drop-size"
  //               to={menu.UIRoute}
  //               activeClassName="selected"
  //             >
  //               {menu.name}
  //             </NavLink>
  //           )}
  //         </li>
  //       ))}
  //     </ul>
  //   );
  // };

  const renderMenu = (selectedHyperScalarMenu = []) => {
    return (
      <>
        {selectedHyperScalarMenu.map((menu, index) => (
          <li className="nav-item dropdown" key={index}>
            <a
              className="nav-link dropdown-toggle pointer"
              data-bs-toggle={menu.subMenu ? "dropdown" : ""}
            >
              {menu?.name}
            </a>
            {menu?.subMenu && renderSubMenu(menu?.subMenu, 1)}
          </li>
        ))
        }
      </>
    );
  };

  useEffect(() => {
    const { cloudProviders, adminRoutes, selectedHyperScalar, Addmodule } =
      navBar || {};
    if (!cloudProviders) {
      featchCloudProvides();
    }
    // if (!commonRoutes) {
    //   setNavBar({ commonRoutes: commonRoutesData });
    // }
    if (user?.role?.trim()?.toUpperCase() === "ADMIN" && !adminRoutes ) {
      setNavBar({ adminRoutes: adminRoutesData });
    }
    
    if (!selectedHyperScalar) {
      setNavBar({ selectedHyperScalar: "AWS" });
      setNavBar({ Addmodule: Addmodule});
    }
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top col-12 mx-auto">
        <div className="container-fluid">
          <img
            src={navlogo}
            className="img-fluid"
            style={{ height: "40px", width: "35px" }}
            alt="home img"
          />
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#main_nav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="main_nav">
            <ul className="navbar-nav">
              <li className="nav-item active">
                {" "}
                <NavLink className="nav-link" to="/">
                  Home{" "}
                </NavLink>{" "}
                
              </li>
              {hyperScalarMenus.map((_, index) => (
                <li className="nav-item dropdown" key={index}>
                  <a
                    className="nav-link dropdown-toggle pointer"
                    data-bs-toggle="dropdown"
                  >
                    {navBar?.selectedHyperScalar}
                  </a>
                  <ul className="dropdown-menu">
                    {navBar?.cloudProviders?.map((cloud, sndIdx) => (
                      <li key={index + sndIdx}>
                        <a className="dropdown-item drop-size">
                          <button
                            className="drop_btn"
                            onClick={setHyperScalar(cloud)}
                          >
                            {cloud.code}
                          </button>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              {renderMenu(navBar?.selectedHyperScalarMenu)}
              {renderSubMenu(navBar?.Addmodule)}
              {renderMenu(navBar?.adminRoutes)}
            </ul>
            <div className="rightmenu">
              <div className="p-grid p-nogutter">
                <NavBarSearch />
                <div className="p-col-2">
                  <Logout signout={logout} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
