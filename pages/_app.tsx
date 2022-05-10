import "../styles/globals.css";
import type { AppProps } from "next/app";
import AuthContextProvider from "src/contexts/auth";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	return (
		<AuthContextProvider route={router.pathname}>
			<Component {...pageProps} />
		</AuthContextProvider>
	);
}

export default MyApp;
