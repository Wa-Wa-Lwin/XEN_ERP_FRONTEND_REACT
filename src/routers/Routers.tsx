
import { createBrowserRouter, Navigate } from "react-router-dom";
// import { Suspense, lazy } from "react";

import Home from "@pages/home/Home"
import LoginPage from "@pages/login/Login"
import Shipment from "@pages/shipment/Shipment"
import ShipmentDetails from "@pages/shipment/components/ShipmentDetails"
import ShipmentDuplicateForm from "@pages/shipment/components/ShipmentDuplicateForm"
import ShipmentEditForm from "@pages/shipment/components/ShipmentEditForm"
import InvoiceView from "@pages/shipment/components/InvoiceView"
import PackingSlipView from "@pages/shipment/components/PackingSlipView"
import Overview from "@features/overview/Overview"
import Logistics from "@features/logistics/Logistics"
import ProtectedRoute from "@components/common/ProtectedRoute";
import Items from "@pages/items/Items";
import Addresses from "@pages/addresses/Addresses";
// import RateCalculator from "@pages/rate-calculator/RateCalculator";
import Dashboard from "@pages/dashboard/Dashboard";
import TestingData from "@features/testingdata/TestingData";
import AddressList from "@pages/address-list/AddressList";
import AddressListDetail from "@pages/address-list/AddressDetail";
import Packaging from "@pages/packaging/Packaging";
import PackagingDetail from "@pages/packaging/PackagingDetail";
import Aftership from "@pages/aftership/Aftership";
import AftershipDetail from "@pages/aftership/AftershipDetail";
import UserList from "@pages/user-list/UserList";
import UserDetail from "@pages/user-list/UserDetail";
import CreateUser from "@pages/user-list/CreateUser";
import EditUser from "@pages/user-list/EditUser";
import ShipmentForm from "@pages/shipment/components/ShipmentForm";
import DHLDomesticRates from "@pages/dhl-domestic-rates/DHLDomesticRates";
import Warehouse from "@pages/warehouse/Warehouse";
import WarehouseShipmentDetail from "@pages/warehouse/components/WarehouseShipmentDetail";
import FedExDomestic from "@pages/fedex-domestic/FedExDomestic";
import FedExDomesticDetail from "@pages/fedex-domestic/FedExDomesticDetail";


export const routes = [
  {
    path: "login", element: <LoginPage />, handle: { breadcrumb: "Login" },
  },
  {
    element: <ProtectedRoute><Home /></ProtectedRoute>,
    children: [
      { path: "overview", element: <Overview />, handle: { breadcrumb: "Overview" } },
      { path: "testing-data", element: <TestingData />, handle: { breadcrumb: "Testing Data" } },
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
            handle: { breadcrumb: "New Request Form" },
          },
          {
            path: "duplicate/:shipmentId",
            element: <ShipmentDuplicateForm />,
            handle: { breadcrumb: "Duplicate Request" },
          },
          {
            path: "edit/:shipmentId",
            element: <ShipmentEditForm />,
            handle: { breadcrumb: "Edit" },
          },
          { path: ":shipmentId",
            element: <ShipmentDetails />,
            handle: { breadcrumb: (match: any) => match.params.shipmentId }
          },
          { path: "invoice/:shipmentId",
            element: <InvoiceView />,
            handle: { breadcrumb: "Invoice" }
          },
          { path: "packing-slip/:shipmentId",
            element: <PackingSlipView />,
            handle: { breadcrumb: "Packing Slip" }
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
      // { path: "rate-calculator",
      //   handle: { breadcrumb: "Rate Calculator" },
      //   children:[
      //     {
      //       path: "",
      //       element: <RateCalculator />,
      //     },
      //   ]
      // },
      { path: "local/address-list",
        handle: { breadcrumb: "Address List" },
        children:[
          {
            path: "",
            element: <AddressList />,
          },
          {
            path: ":id",
            element: <AddressListDetail />,
            handle: { breadcrumb: (match: any) => match.params.id }
          },
        ]
      },
      { path: "local/packaging-list",
        handle: { breadcrumb: "Packaging Boxes" },
        children:[
          {
            path: "",
            element: <Packaging />,
          },
          {
            path: ":id",
            element: <PackagingDetail />,
            handle: { breadcrumb: (match: any) => match.params.id }
          },
        ]
      },
      { path: "dashboard",
        handle: { breadcrumb: "Dashboard" },
        children:[
          {
            path: "",
            element: <Dashboard />,
          },
        ]
      },
      { path: "aftership",
        handle: { breadcrumb: "Aftership" },
        children:[
          {
            path: "",
            element: <Aftership />,
          },
          {
            path: ":id",
            element: <AftershipDetail />,
            handle: { breadcrumb: (match: any) => match.params.id }
          },
        ]
      },
      { path: "user-list",
        handle: { breadcrumb: "User Management" },
        children:[
          {
            path: "",
            element: <UserList />,
          },
          {
            path: "create",
            element: <CreateUser />,
            handle: { breadcrumb: "Create User" }
          },
          {
            path: ":id",
            element: <UserDetail />,
            handle: { breadcrumb: (match: any) => match.params.id }
          },
          {
            path: ":id/edit",
            element: <EditUser />,
            handle: { breadcrumb: "Edit" }
          },
        ]
      },
      { path: "rates/dhl-domestic",
        handle: { breadcrumb: "DHL Domestic Rates" },
        children:[
          {
            path: "",
            element: <DHLDomesticRates />,
          },
        ]
      },
      { path: "warehouse",
        handle: { breadcrumb: "Warehouse" },
        children:[
          {
            path: "",
            element: <Warehouse />,
          },
          {
            path: ":id",
            element: <WarehouseShipmentDetail />,
            handle: { breadcrumb: (match: any) => `Shipment ${match.params.id}` }
          },
        ]
      },
      { path: "fedex-domestic",
        handle: { breadcrumb: "FedEx Domestic" },
        children:[
          {
            path: "",
            element: <FedExDomestic />,
          },
          {
            path: ":id",
            element: <FedExDomesticDetail />,
            handle: { breadcrumb: (match: any) => `Shipment ${match.params.id}` }
          },
        ]
      },
    ],
  },
  {
    path: "*", element: <Navigate to="/login" replace />,
  }
];


export const Router = createBrowserRouter(routes, {
  basename: "/xeno-shipment"
});
