import { GetStaticProps } from 'next';
import Head from 'next/head';
import {FiCalendar, FiUser} from 'react-icons/fi'
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | spacetraviling</title>
      </Head>

      <main className={styles.homeContainer}>
        <img src="/images/Logo.svg" alt=""/>
          <div>
            <span>Como utilizar Hooks</span>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>

            <div className={styles.content}>
              <time><FiCalendar size={15}/> 15 Mar 2021</time>
              <p><FiUser size={15}/> Davi Barbosa</p>
            </div>
          </div>
          <div>
            <span>Como utilizar Hooks</span>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>

            <div className={styles.content}>
              <time><FiCalendar size={15}/> 15 Mar 2021</time>
              <p><FiUser size={15}/> Davi Barbosa</p>
            </div>
          </div>
          <div>
            <span>Como utilizar Hooks</span>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>

            <div className={styles.content}>
              <time><FiCalendar size={15}/> 15 Mar 2021</time>
              <p><FiUser size={15}/> Davi Barbosa</p>
            </div>
          </div>
          <div>
            <span>Como utilizar Hooks</span>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>

            <div className={styles.content}>
              <time><FiCalendar size={15}/> 15 Mar 2021</time>
              <p><FiUser size={15}/> Davi Barbosa</p>
            </div>
          </div>

          <button type="button">
          Carregar mais posts
          </button>
      </main>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
