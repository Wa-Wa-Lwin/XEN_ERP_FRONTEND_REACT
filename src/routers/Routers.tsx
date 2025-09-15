
import { createBrowserRouter, Navigate } from "react-router-dom";
// import { Suspense, lazy } from "react";

import Home from "@pages/home/Home"
import LoginPage from "@pages/login/Login"
import Shipment from "@pages/shipment/Shipment"
import ShipmentDetails from "@pages/shipment/components/ShipmentDetails"
import ShipmentForm from "@pages/shipment/components/ShipmentForm"
import Overview from "@features/overview/Overview"
import Logistics from "@features/logistics/Logistics"
import ProtectedRoute from "@components/common/ProtectedRoute";
import Items from "@pages/items/Items";
import Addresses from "@pages/addresses/Addresses";
import RateCalculator from "@pages/rate_calculator/RateCalculator";


export const routes = [
  {
    path: "login", element: <LoginPage />, handle: { breadcrumb: "Login" },
  },
  {
    element: <ProtectedRoute><Home /></ProtectedRoute>,
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
      { path: "items", 
        handle: { breadcrumb: "Items" },
        children:[
          {
            path: "",
            element: <Items />,
          },          
        ]
      },
      { path: "addresses", 
        handle: { breadcrumb: "Addresses" },
        children:[
          {
            path: "",
            element: <Addresses />,
          },          
        ]
      },
      { path: "rate-calculator",
        handle: { breadcrumb: "Rate Calculator" },
        children:[
          {
            path: "",
            element: <RateCalculator />,
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
