import styles from './App.module.css';
function App() {
  return (
    <div className={styles.app}>
      <div className={styles.sider}>
        <div className={styles.logo}>logo</div>
      </div>
      <div className={styles.main}>
        <div className={styles.header}>header</div>
        <div className={styles.content}>content</div>
      </div>
      <div className={styles.footer}>footer</div>
    </div>
  );
}

export default App;
