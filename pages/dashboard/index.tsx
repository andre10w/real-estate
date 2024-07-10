import React, {useEffect} from 'react';
import {useRouter} from "next/router";
import DashboardChecklist from "../../src/components/dashboard/DashboardChecklist";
import DashboardPropertylist from "../../src/components/dashboard/DashboardPropertyList";
import { useAppSelector, initializeStore,} from "../../src/store";
import {fetchProperties} from "../../src/slices/properties";
import {fetchUserGroups} from "../../src/slices/groups";
import { GetServerSidePropsContext } from 'next';



const Dashboard: React.FC = () => {
    const propertiesReducer = useAppSelector((state) => state.propertiesReducer);
    const properties = propertiesReducer.properties;




    return (
            <div>
                <div style={{ margin: "0 5%" }}>
                    <DashboardPropertylist properties={properties} status={propertiesReducer.status} />
                    <DashboardChecklist />
                </div>
            </div>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    // Fetch the data for properties
    const store = initializeStore();
    await Promise.all([
      store.dispatch(fetchProperties({ isServer: true, req: context.req, res: context.res })),
      store.dispatch(fetchUserGroups({ isServer: true, req: context.req, res: context.res }))
    ]);
    // Get only the part of the state that has changed (propertiesReducer in this case)
    const { propertiesReducer, groupsReducer } = store.getState();
    return { props: { initialState: { propertiesReducer, groupsReducer } } };
  } catch (error) {
    console.log("ERROR", error);
    return { props: { basicAddressData: false } };
  }
}
  


export default Dashboard;