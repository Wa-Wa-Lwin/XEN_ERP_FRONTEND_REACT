
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
// const Home = lazy(() => import('@pages/home/Home'));
// const LoginPage = lazy(() => import('@pages/Login'));
// const Shipment = lazy(() => import('@features/shipment/Shipment'));
// const ShipmentDetails = lazy(() => import('@features/shipment/components/ShipmentDetails'));
// const ShipmentForm = lazy(() => import('@features/shipment/components/ShipmentForm'));
// const Overview = lazy(() => import('@features/overview/Overview'));
// const Logistics = lazy(() => import('@features/logistics/Logistics'));


import Home from "@pages/home/Home"
import LoginPage from "@pages/Login"
import Shipment from "@features/shipment/Shipment"
import ShipmentDetails from "@features/shipment/components/ShipmentDetails"
import ShipmentForm from "@features/shipment/components/ShipmentForm"
import Overview from "@features/overview/Overview"
import Logistics from "@features/logistics/Logistics";





export const routes = [
  {
    path: "login", element: <LoginPage />, handle: { breadcrumb: "Login" },
  },
  {
    element: <Home />,
    children: [
      { path: "overview", element: <Overview />, handle: { breadcrumb: "Overview" } },
      { path: "logistics/:category?", element: <Logistics />, handle: { breadcrumb: "Logistics" } },
      { path: "shipment", 
        handle: { breadcrumb: "Shipment" },
        children:[
          {
            path: "",
            element: <Shipment />,
          },
          {
            path: "request-form",
            element: <ShipmentForm />,
            handle: { breadcrumb: "Request Form" },
          },
          { path: ":shipmentId", 
            element: <ShipmentDetails />, 
            handle: { breadcrumb: (match: any) => match.params.shipmentId }
          },
        ]
      },
    ],
  },
  {
    path: "*", element: <Navigate to="/login" replace />,
  }
];


export const Router = createBrowserRouter(routes);
