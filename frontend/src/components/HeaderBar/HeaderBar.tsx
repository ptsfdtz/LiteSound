import {Button, Dialog, Input, Transition} from '@headlessui/react';
import {FaCog, FaFolderOpen, FaTimes, FaWindowMaximize, FaWindowMinimize, FaWindowRestore} from 'react-icons/fa';
import {Fragment, useEffect, useState} from 'react';
import {Quit, WindowIsMaximised, WindowMaximise, WindowMinimise, WindowUnmaximise} from '../../../wailsjs/runtime/runtime';
import {api} from '@/services/api';
import appIcon from '@/assets/appicon.svg';
import styles from '@/components/HeaderBar/HeaderBar.module.css';

type HeaderBarProps = {
    title: string;
    onRefresh: () => void;
    musicDir: string;
    onSetMusicDir: (path: string) => void;
};

export function HeaderBar(props: HeaderBarProps) {
    const {title, onRefresh, musicDir, onSetMusicDir} = props;
    const [isMaximised, setIsMaximised] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [dirValue, setDirValue] = useState(musicDir);

    useEffect(() => {
        let mounted = true;
        const syncState = async () => {
            try {
                const maxed = await WindowIsMaximised();
                if (mounted) {
                    setIsMaximised(maxed);
                }
            } catch {
                if (mounted) {
                    setIsMaximised(false);
                }
            }
        };
        void syncState();
        return () => {
            mounted = false;
        };
    }, []);

    const toggleMaximise = async () => {
        try {
            const maxed = await WindowIsMaximised();
            if (maxed) {
                await WindowUnmaximise();
                setIsMaximised(false);
            } else {
                await WindowMaximise();
                setIsMaximised(true);
            }
        } catch {
            // Ignore errors from window control
        }
    };

    const handleMinimise = async () => {
        try {
            await WindowMinimise();
        } catch {
            // Ignore errors from window control
        }
    };

    const handleClose = async () => {
        try {
            await Quit();
        } catch {
            // Ignore errors from window control
        }
    };

    const openSettings = () => {
        setDirValue(musicDir);
        setIsSettingsOpen(true);
    };

    const handlePickDir = async () => {
        try {
            const picked = await api.pickMusicDir(dirValue || musicDir);
            if (picked) {
                setDirValue(picked);
            }
        } catch {
            // Ignore dialog errors
        }
    };

    const handleSave = () => {
        onSetMusicDir(dirValue);
        setIsSettingsOpen(false);
    };

    const handleReset = () => {
        onSetMusicDir('');
        setIsSettingsOpen(false);
    };
    return (
        <header className={styles.header}>
            <div className={styles.brand}>
                <img className={styles.logo} src={appIcon} alt="LiteSound" />
                <h1>{title}</h1>
            </div>
            <div className={styles.actions}>
                <Button className={styles.ghost} aria-label="Settings" onClick={openSettings}>
                    <FaCog />
                </Button>
                <div className={styles.windowControls}>
                    <Button className={styles.windowButton} onClick={handleMinimise} aria-label="Minimise">
                        <FaWindowMinimize />
                    </Button>
                    <Button className={styles.windowButton} onClick={toggleMaximise} aria-label="Maximise">
                        {isMaximised ? <FaWindowRestore /> : <FaWindowMaximize />}
                    </Button>
                    <Button className={styles.windowButton} onClick={handleClose} aria-label="Close">
                        <FaTimes />
                    </Button>
                </div>
            </div>
            <Transition show={isSettingsOpen} as={Fragment}>
                <Dialog onClose={() => setIsSettingsOpen(false)} className={styles.dialog}>
                    <Transition.Child
                        as={Fragment}
                        enter={styles.menuEnter}
                        enterFrom={styles.menuEnterFrom}
                        enterTo={styles.menuEnterTo}
                        leave={styles.menuLeave}
                        leaveFrom={styles.menuLeaveFrom}
                        leaveTo={styles.menuLeaveTo}
                    >
                        <div className={styles.overlay} />
                    </Transition.Child>
                    <div className={styles.dialogContainer}>
                        <Transition.Child
                            as={Fragment}
                            enter={styles.menuEnter}
                            enterFrom={styles.menuEnterFrom}
                            enterTo={styles.menuEnterTo}
                            leave={styles.menuLeave}
                            leaveFrom={styles.menuLeaveFrom}
                            leaveTo={styles.menuLeaveTo}
                        >
                            <Dialog.Panel className={styles.dialogPanel}>
                                <Dialog.Title className={styles.dialogTitle}>Settings</Dialog.Title>
                                <div className={styles.dialogBody}>
                                    <div className={styles.fieldRow}>
                                        <Input
                                            className={styles.input}
                                            value={dirValue}
                                            onChange={(event) => setDirValue(event.target.value)}
                                            placeholder="Music folder path"
                                        />
                                        <Button className={styles.button} onClick={handlePickDir}>
                                            <FaFolderOpen /> Browse
                                        </Button>
                                    </div>
                                    <div className={styles.hint}>
                                        Default music folder is the system Music directory.
                                    </div>
                                    <div className={styles.actionsRow}>
                                        <Button className={styles.button} onClick={onRefresh}>
                                            Refresh
                                        </Button>
                                        <div className={styles.actionsGroup}>
                                            <Button className={styles.button} onClick={handleReset}>
                                                Use default
                                            </Button>
                                            <Button className={styles.button} onClick={handleSave}>
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </header>
    );
}
