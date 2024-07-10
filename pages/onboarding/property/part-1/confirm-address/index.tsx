import { getCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { makeAuthedApiRequest } from '../../../../../src/utils/api/apiHelper';
import ConfirmAddressPage, {BasicAddressData} from '../../../../../src/components/reactPages/onboarding/ConfirmAddressPage';

const ConfirmAddress = (props: { basicAddressData: BasicAddressData}) => {

    return (
        <ConfirmAddressPage addressdata={props.basicAddressData}/>
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
        const basicAddressData = response?.data;
        if (!basicAddressData) {
            return { props: { propertyId } };
        }
        basicAddressData.property.propertyId = propertyId;
        return { props: { basicAddressData: basicAddressData.property } };
    } catch (error) {
        console.log("ERROR", error);
        return { props: { basicAddressData: false } }
    }

}

export default ConfirmAddress;