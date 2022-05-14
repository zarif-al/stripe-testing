import "../styles/globals.css";
import "antd/dist/antd.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Layout from "src/components/layout";
import AuthContextProvider from "src/contexts/auth";

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	return (
		<AuthContextProvider route={router.pathname}>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</AuthContextProvider>
	);
}

export default MyApp;
