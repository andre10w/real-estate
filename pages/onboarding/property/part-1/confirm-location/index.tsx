import { GetServerSidePropsContext } from 'next';
import { makeAuthedApiRequest } from '../../../../../src/utils/api/apiHelper';
import ConfirmLocationPage, {BasicLocationData} from '../../../../../src/components/reactPages/onboarding/ConfirmLocationPage';

const ConfirmLocation = (props: { basicAddressData: BasicLocationData}) => {
    return (
        <ConfirmLocationPage locationData={props.basicAddressData}/>
    )
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
    try {
        const { req, res, query } = context;
        const propertyId = query.propertyId;
        if (!propertyId) {
            return { props: {} };
        }
        const data = { propertyId };
        const response = await makeAuthedApiRequest({method: 'get', data, urlExtension: '/v1/property/basicAddressInfo', isServer: true, req, res});
        const basicAddressData = await response?.data;
        basicAddressData.property.propertyId = propertyId;
        return { props: { basicAddressData: basicAddressData.property } };
    } catch (error) {
        console.log("ERROR", error);
        return { props: { basicAddressData: false } }
    }

    
}

export default ConfirmLocation;