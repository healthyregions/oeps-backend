import Link from 'next/link';
import { Menu, MenuList, MenuButton, MenuLink } from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import styles from "./MainNav.module.css";

export default function MainNav() {
  return (
    <div className={styles.masthead}>
      <h3 className={styles.mastheadTitle}>
        <Link href="/">OEPS Explorer</Link>
      </h3>
      <nav className={styles.mainNav}>
        <Menu>
          <MenuButton>
            Menu{" "}
            <span aria-hidden className={styles.hamburger}>
              ☰
            </span>
          </MenuButton>
          <MenuList id="menu">
            <MenuLink as="a" href="/">
              Home
            </MenuLink>
            <MenuLink as="a" href="/map">
              Map
            </MenuLink>
            <MenuLink as="a" href="/insights">
              Insights
            </MenuLink>
            <MenuLink as="a" href="/methods">
              Methodology
            </MenuLink>
            <MenuLink as="a" href="/docs">
              Data Docs
            </MenuLink>
            <MenuLink as="a" href="/download">
              Data Access
            </MenuLink>
            <MenuLink as="a" href="/codeResources">
              Code Resources
            </MenuLink>
            <MenuLink as="a" href="/about">
              About
            </MenuLink>
          </MenuList>
        </Menu>
      </nav>
    </div>
  );
}
