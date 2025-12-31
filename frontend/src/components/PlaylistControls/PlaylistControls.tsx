import {Button, Input} from '@headlessui/react';
import styles from './PlaylistControls.module.css';

type PlaylistControlsProps = {
    playlistName: string;
    onNameChange: (value: string) => void;
    onCreate: () => void;
    onAddCurrent: () => void;
    status: string;
    canAdd: boolean;
};

export function PlaylistControls(props: PlaylistControlsProps) {
    const {playlistName, onNameChange, onCreate, onAddCurrent, status, canAdd} = props;
    return (
        <div className={styles.controls}>
            <Input
                className={styles.input}
                type="text"
                placeholder="New playlist name"
                value={playlistName}
                onChange={(event) => onNameChange(event.target.value)}
            />
            <Button className={styles.button} onClick={onCreate}>
                Create
            </Button>
            <Button className={styles.button} onClick={onAddCurrent} disabled={!canAdd}>
                Add current track
            </Button>
            {status && <span className={styles.status}>{status}</span>}
        </div>
    );
}
