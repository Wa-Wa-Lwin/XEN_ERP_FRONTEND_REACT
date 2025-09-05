import { Provider } from "react-redux";
import { store } from "@redux/store";
import { Suspense, lazy } from "react";
import { RouterProvider } from "react-router-dom";
import { Router } from "@routers/Routers";

function App() {
	return (
		<Provider store={store}>
			{/* <Suspense fallback={<Loading />}> */}
				<RouterProvider router={Router} />
			{/* </Suspense> */}
		</Provider>
	);
}

export default App;

const Loading = () => (
	<div className="flex items-center justify-center min-h-screen">
		<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
	</div>
);
