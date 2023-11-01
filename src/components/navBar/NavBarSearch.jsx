import axios from 'axios';
import { ListBox } from 'primereact/listbox';
import { useCallback, useContext, useLayoutEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { ToasterContext } from '../common/Context';
import settings from '../../settings.json';
import lodash from 'lodash';
import { unstable_batchedUpdates } from 'react-dom';
import { useHistory } from 'react-router';
import useNavBar from '../../hooks/useNavBar';

const { ip } = settings;

export default function NavBarSearch() {

    const [_, setNavBar] = useNavBar();

    const history = useHistory();

    const { addMessage } = useContext(ToasterContext);

    const [options, setOptions] = useState([]);

    const [selectedItem, setSelectedItem] = useState(null);

    const [filterString, setFilterString] = useState(null);

    const selectedItemHandler = ({ value }) => {
        setSelectedItem(value);
    }

    const searchFilterHandler = ({ value }) => {
        setFilterString(value);
        if (value.trim().length > 1) {
            debounceSearch(value);
        }
    }

    const fetchSearchResults = (searchValue) => {
        const page = 0, rows = 100, sortField = 'useCaseId', sortOrder = -1,
            filters = { name: { value: searchValue, matchMode: 'contains' } };
        axios.get(`${ip}usecase`, {
            params: {
                page,
                size: parseInt(rows),
                sortField,
                sortOrder,
                filters
            }
        }).then(({ data: { rows } }) => {
            setOptions(rows);
        }).catch((e) => {
            addMessage({
                severity: 'error', summary: 'Fetch usecases',
                detail: 'Failed to fetch usecases', sticky: true
            });
        });
    }

    const clearFilter = (e) => {
        if (!document.querySelector('.usecase-search').contains(e.target)) {
            unstable_batchedUpdates(() => {
                setOptions([]);
                setFilterString(null);
            });
        }
    }

    const listItemTemplate = (option) => {

        const { cloudId } = option;

        const navigate = (e) => {

            e.preventDefault();
            e.stopPropagation();
            setNavBar({ cloudId });
            history.push(option.UIRoute);
        }

        const openInNewTab = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setNavBar({ cloudId });
            window.open(e.currentTarget.href, '_blank');
        }

        return (
            <div className="p-grid p-nogutter p-justify-center">
                <div className="p-col-11">
                    <span onClick={navigate}>{option.name}</span>
                </div>
                <div className="p-col-1">
                    <a href={`${window.location.origin}${option.UIRoute}`} target="_blank"
                        onClick={openInNewTab}>
                        <i className={`pi pi-external-link ${classes['externla-link']}`}></i>
                    </a>
                </div>
            </div>
        )
    }

    const debounceSearch = useCallback(lodash.debounce(fetchSearchResults, 300), []);

    useLayoutEffect(() => {
        document.addEventListener('mousedown', clearFilter);
        return () => {
            document.removeEventListener('mousedown', clearFilter);
        }
    }, []);

    const prepateDummyListElement = () => {
        const li = document.createElement('li');
        li.classList.add('no-data');
        li.classList.add('p-listbox-item');
        li.innerHTML = 'No Data Found';
        return li;
    }

    const prepareClearButton = () => {
        const span = document.createElement('span');
        span.classList.add('clear-button');
        span.innerHTML = 'x';
        span.onclick = (e) => {
            e.preventDefault();
            unstable_batchedUpdates(() => {
                setOptions([]);
                setFilterString(null);
            });
        }
        return span;
    }

    useLayoutEffect(() => {
        const UlElement = document.querySelector('.usecase-search .p-listbox-list');
        const LiElement = document.querySelector('.usecase-search .p-listbox-list > .no-data');
        if (!options.length && filterString && !LiElement) {
            UlElement?.appendChild(prepateDummyListElement());
        } else {
            if ((LiElement && options.length) || (LiElement && !(filterString || '').trim().length)) {
                UlElement?.removeChild(LiElement);
            }
        }
    }, [options]);

    useLayoutEffect(() => {
        const listContainer = document.querySelector('.usecase-search .p-listbox-filter-container');
        const clearButton = document.querySelector('.usecase-search .p-listbox-filter-container .clear-button');
        if (filterString && !clearButton) {
            listContainer?.appendChild(prepareClearButton());
        } else {
            if (!filterString && clearButton) {
                listContainer?.removeChild(clearButton);
            }
        }
    }, [filterString])

    const useStyles = createUseStyles({
        'listbox-container': {
            position: 'relative',
            width: `20rem`,
            '& ~ div[class*="p-col-"]': {
                width: '3rem'
            }
        },
        listbox: {
            position: 'absolute',
            width: '97%',
            top: 4,
            border: 'none',
            background: '#f8f9fa',
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            '& .p-listbox-header': {
                padding: 0,
                background: 'transparent',
                border: 'none',
                '& .clear-button': {
                    position: 'absolute',
                    right: '2.4rem',
                    top: '3px',
                    cursor: 'pointer',
                    fontWeight: 700
                }
            },
            '& .p-listbox-list-wrapper': {
                border: (props) => {
                    return `${props.options.length ? '1px solid #ced4da' : 'none'}`
                }
            }
        },
        'externla-link': {
            fontSize: '0.85rem'
        }
    });

    const classes = useStyles({ options });

    return (
        <div className={`p-col-10 ${classes['listbox-container']}`}>
            <ListBox value={selectedItem} options={options} optionLabel="name"
                onChange={selectedItemHandler} filter className={`${classes.listbox} usecase-search`}
                listStyle={{ maxHeight: '250px' }} onFilterValueChange={searchFilterHandler}
                filterPlaceholder="Search.." filterValue={filterString}
                itemTemplate={listItemTemplate} />
        </div>
    );
}