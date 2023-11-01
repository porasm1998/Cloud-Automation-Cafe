import { ProgressSpinner } from "primereact/progressspinner";
import { createUseStyles } from 'react-jss';

export default function BlockUI() {
    const useStyles = createUseStyles({
        'block-ui': {
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            display: 'flex',
            justifyContent: 'center',
            verticalAlign: 'middle',
            alignItems: 'center',
            background: '#d9c7c7'
        }
    });
    const classes = useStyles();
    return (
        <div className={classes["block-ui"]}>
            <ProgressSpinner />
        </div>
    )
}