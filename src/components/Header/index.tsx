import Link from 'next/link';
import styles from './header.module.scss';

export function Header() {
  return (
    <div className={styles.container}>
      <Link href="/">
        <a>
          <img src="/images/Logo.svg" alt="logo" />
        </a>
      </Link>
    </div>
  );
}
