import {Button, Menu, Transition} from '@headlessui/react';
import {FaCog, FaTimes, FaWindowMaximize, FaWindowMinimize, FaWindowRestore} from 'react-icons/fa';
import {Fragment, useEffect, useState} from 'react';
import {Quit, WindowIsMaximised, WindowMaximise, WindowMinimise, WindowUnmaximise} from '../../../wailsjs/runtime/runtime';
import styles from './HeaderBar.module.css';

type HeaderBarProps = {
    title: string;
    onRefresh: () => void;
};

export function HeaderBar(props: HeaderBarProps) {
    const {title, onRefresh} = props;
    const [isMaximised, setIsMaximised] = useState(false);

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
    return (
        <header className={styles.header}>
            <div>
                <h1>{title}</h1>
            </div>
            <div className={styles.actions}>
                <Menu as="div" className={styles.menu}>
                    <Menu.Button className={styles.ghost} aria-label="Settings">
                        <FaCog />
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter={styles.menuEnter}
                        enterFrom={styles.menuEnterFrom}
                        enterTo={styles.menuEnterTo}
                        leave={styles.menuLeave}
                        leaveFrom={styles.menuLeaveFrom}
                        leaveTo={styles.menuLeaveTo}
                    >
                        <Menu.Items className={styles.menuItems}>
                            <Menu.Item>
                                {({active: isActive}) => (
                                    <Button
                                        className={isActive ? `${styles.menuItem} ${styles.menuItemActive}` : styles.menuItem}
                                        onClick={onRefresh}
                                    >
                                        Refresh
                                    </Button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
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
        </header>
    );
}
