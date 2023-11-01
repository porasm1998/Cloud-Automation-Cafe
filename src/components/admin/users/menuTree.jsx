import { useEffect, useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Tree } from 'primereact/tree';
import settings from '../../../settings.json';
import axios from 'axios';
import { Button } from 'primereact/button';

const { ip } = settings;

export default function MenuTreeSlidebar({ showSlider = false, onHide, onError, user = {} }) {
    return (
        <Sidebar visible={showSlider} position="right" onHide={onHide} modal showCloseIcon={false}
            className="custom-sidebar">
            <h3>UseCase Menu</h3>
            <div className="p-grid">
                <div className="p-col-12 p-md-12">
                    <MenuTree onError={onError} onHide={onHide} user={user}></MenuTree>
                </div>
            </div>
        </Sidebar>
    );
}

export function MenuTree({ onError, onHide, user }) {

    const [selectedMenu, setSelectedMenu] = useState(null);
    const [useCaseMenu, setUseCaseMenu] = useState(null);
    const [cloudProviders, setCloudProviders] = useState(null);

    const onSelectionChange = ({ value }) => {
        setSelectedMenu(value);
    }

    const fetchData = async () => {
        try {
            const page = 0, rows = 1000, sortField = 'useCaseId', sortOrder = -1, filters = {};
            const apiData = await Promise.allSettled([axios.get(`${ip}cloud`),
            axios.get(`${ip}usecase?page=${page}&size=${parseInt(rows)}&sortField=${sortField}&sortOrder=${parseInt(sortOrder)}&filters=${JSON.stringify(filters)}`),
            fetchUserMenuPermissions()
            ]);
            const [cloudProviders, useCases, userMenus] = apiData;
            const { value: { data } } = cloudProviders;
            const { value: { data: { rows: records } } } = useCases;
            const { value: userMenuData } = userMenus;
            setCloudProviders(data);
            const totalUseCaseMenuData = prepareTreeStructure(data, records);
            prepareSelectedTreeMenu(userMenuData, totalUseCaseMenuData);
        } catch (_) {
            onError({
                severity: 'error', summary: 'Fetch usecases',
                detail: 'Failed to fetch cloud providers / Usecases', sticky: true 
            });
        }
    }

    const fetchUserMenuPermissions = async () => {
        const { userId } = user;
        try {
            const { data } = await axios.get(`${ip}user/menu/${userId}`);
            return data;
        } catch (e) {
            onError({
                severity: 'error', summary: 'UseCase Menu',
                detail: `Failed to fetch UseCase Menu for user : ${user.name}`, sticky: true 
            });
            return new Error(e);
        }
    }

    const prepareSelectedTreeMenu = (userMenu, totalUseCaseMenuData) => {
        const { uuseCase = [] } = userMenu;
        const map = new Map();
        const selectedMenu = uuseCase.reduce((acc, item) => {
            const { usersUseCases, cloudId } = item;
            if (map.has(cloudId)) {
                map.set(cloudId, (map.get(cloudId) + 1));
            } else {
                map.set(cloudId, 1);
            }
            const { useCaseId, selected: checked, partialSelected: partialChecked } = usersUseCases;
            acc[useCaseId] = { checked, partialChecked };
            return acc;
        }, {});
        const flatMenu = flatUseCaseMenu(totalUseCaseMenuData);
        const groupCount = getGroupedCount(flatMenu);
        setSelectedMenuParentsBaseOnCount(groupCount, map, selectedMenu);
        setSelectedMenu(selectedMenu);
    }

    const flatUseCaseMenu = (useCaseMenu) => {
        return useCaseMenu.reduce((acc, menu, index) => {
            if ((menu.children || []).length) {
                acc = acc.concat(...flatUseCaseMenu(menu.children, selectedMenu));
            }
            acc.unshift(menu);
            return acc;
        }, []);
    }

    const getGroupedCount = (flatMenu = []) => {
        return flatMenu.reduce((acc, menu) => {
            if (menu.cloudId in acc) {
                acc[menu.cloudId] = (acc[menu.cloudId] + 1);
            } else {
                acc[menu.cloudId] = 0;
            }
            return acc;
        }, {});
    }

    const setSelectedMenuParentsBaseOnCount = (groupCounts, map, selectedMenu) => {
        map.forEach((v, k) => {
            if (v === groupCounts[k]) {
                selectedMenu[k] = { checked: true, partialChecked: false };
            } else {
                selectedMenu[k] = { checked: false, partialChecked: true };
            }
        });
    }

    const prepareTreeStructure = (clouds, data) => {
        const menu = clouds.map((cloud) => {
            cloud.key = cloud.cloudId;
            cloud.label = cloud.code;
            const filterData = data.filter(f => f.cloudId === cloud.cloudId);
            cloud.children = prepareTreeFormat(filterData);
            return cloud;
        });
        setUseCaseMenu(menu);
        return menu;
    }

    const prepareTreeFormat = (data = []) => {
        return data.filter(f => !f.parentId).map((item) => {
            item.key = item.useCaseId;
            item.label = item.name;
            item.children = getChildMenu(data, item.useCaseId);
            if (!item.children.length) {
                delete item.children;
            }
            return item;
        });
    }

    const getChildMenu = (data = [], parentId) => {
        return data
            .filter(item => {
                return item?.useCase?.useCaseId === parentId;
            }).map(item => {
                item.key = item.useCaseId;
                item.label = item.name;
                item.children = getChildMenu(data, item?.useCaseId);
                if (!item.children.length) {
                    delete item.children;
                }
                return item;
            });
    }

    const onSave = () => {
        const { userId } = user;
        const data = Object.keys(selectedMenu).filter(key => {
            return !cloudProviders.find(cloud => parseInt(cloud.cloudId) === parseInt(key));
        }).map(key => {
            const { checked: selected, partialChecked: partialSelected } = selectedMenu[key];
            return { userId, useCaseId: parseInt(key), selected, partialSelected };
        })
        saveUserMenuPermissions(userId, data);
    }

    const saveUserMenuPermissions = (userId, data) => {
        axios.post(`${ip}user/menu/${userId}`, data).then(() => {
            onError({
                severity: 'success', summary: 'UseCase Menu',
                detail: `Successfully saved UseCase Menu for user : ${user.name}`, sticky: true 
            });
            onHide();
        }).catch(() => {
            onError({
                severity: 'error', summary: 'UseCase Menu',
                detail: `Failed to save UseCase Menu for user : ${user.name}`, sticky: true 
            });
        });
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <Tree value={useCaseMenu} selectionMode="checkbox" selectionKeys={selectedMenu}
                onSelectionChange={onSelectionChange} filter filterMode="lenient" />
            <div className="p-col-12 button-action">
                <Button label="Cancel" className="p-button-secondary" onClick={onHide} />
                <Button label="Save" onClick={onSave} />
            </div>
        </>
    );
}