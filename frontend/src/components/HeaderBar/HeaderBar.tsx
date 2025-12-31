import {Button, Menu, Transition} from '@headlessui/react';
import {FaCog} from 'react-icons/fa';
import {Fragment} from 'react';
import styles from './HeaderBar.module.css';

type HeaderBarProps = {
    title: string;
    subtitle: string;
    onRefresh: () => void;
};

export function HeaderBar(props: HeaderBarProps) {
    const {title, subtitle, onRefresh} = props;
    return (
        <header className={styles.header}>
            <div>
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>
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
        </header>
    );
}
