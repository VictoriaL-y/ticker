import { CounterProvider } from "@/counter/counter-context";
import { Counter } from "@/counter/Counter";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <CounterProvider>
        <Counter />
      </CounterProvider>
    </main>
  );
}
