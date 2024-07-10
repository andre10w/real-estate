import { GetServerSidePropsContext } from 'next';
import { makeAuthedApiRequest } from '../../src/utils/api/apiHelper';
import MakeOfferPage from '../../src/components/make-offer/MakeOfferPage';
import styled from '@emotion/styled'
import {PropertyModel} from "../../src/slices/properties";
import {GroupWithMembersModel, fetchUserGroups} from "../../src/slices/groups";
import { useAppSelector, useAppDispatch } from "../../src/store";
import MakeOfferFrame from "../../src/components/make-offer/MakeOfferFrame";
import {useEffect, useRef, useState} from "react";
import MakeOfferPropDetailsPage from "../../src/components/make-offer/MakeOfferPropDetailsPage";
import MakeOfferContiPage from "../../src/components/make-offer/MakeOfferContiPage";
import MakeOfferDatesPage from "../../src/components/make-offer/MakeOfferDatesPage";
import MakeOfferReviewPage from "../../src/components/make-offer/MakeOfferReviewPage";
import StatusMessage, {DarkStatusMessage} from "../../src/components/stuff/StatusMessage";
import {OfferModel} from "../../src/models/offerModel";
import { H4, MintParagraph } from '../../src/components/Typography/Typography';
import {useRouter} from "next/router";
import { H2, H5, H6 } from '../../src/components/Typography/Typography';
import SecondaryButton from '../../src/components/buttons/SecondaryButton';
import { colors } from '../../src/styles/colors';
import Select from "react-select";
import { AxiosError } from 'axios';
import { customStyles } from '../../src/constants';
import OnboardingScreenFrame from '../../src/components/stuff/OnboardingScreenFrame';
import { useDevice } from '../../src/contexts/DeviceContext';
import AuthNav from '../../src/components/headerFooter/AuthNav';
import MultipleChoiceParent from '../../src/components/stuff/MultipleChoiceParent';
import Link from 'next/link';
import he from 'he';

export type OfferMainPageProps = {
    propertyInfo: PropertyModel,
    offerInfo?: OfferModel
}

const StyledContentDiv = styled.div`
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: flex-start;
    width: 100%;
    max-width: 740px;
    position: relative;
    box-sizing: border-box;
    margin-top: 64px;
    padding-left: 24px;
    padding-right: 24px;
    overflow: auto;
`;
const ContentParent = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    height: calc(100vh - 80px);
`

const OfferMainPage = (props: OfferMainPageProps) => {
    const router = useRouter();
    const { isMobile } = useDevice();
    const dispatch = useAppDispatch();
    const childRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(props.offerInfo?.stepFiveComplete ? 5 : props.offerInfo?.stepFourComplete ? 5 : props.offerInfo?.stepThreeComplete ? 4 : props.offerInfo?.stepTwoComplete ? 3 : props.offerInfo?.stepOneComplete ? 2 : 1);
    const [offerInfo, setOfferInfo] = useState(props.offerInfo);
    const [currentStep, setCurrentStep] = useState(props.offerInfo ? 3 : 0);
    
    const userState = useAppSelector((state) => state.userReducer);
    const groups = useAppSelector((state) => state.groupsReducer.groups);
    const [selectedGroup, setSelectedGroup] = useState<GroupWithMembersModel>();
    const [hasVisitedOffer, setHasVisitedOffer] = useState<boolean>(false);
    const [selectedMortgageOptionIndex, setSelectedMortgageOptionIndex] = useState<number>(0);

    useEffect(() => {
        if (selectedGroup) {
            return;
        }
        setSelectedGroup(groups[0]);
    }, [groups, selectedGroup]);

    const [error, setError] = useState('');

    useEffect(() => {dispatch(fetchUserGroups({}))}, [dispatch]);
    useEffect(() => {
        if (router.query.propertyId && offerInfo && !hasVisitedOffer) {
            setHasVisitedOffer(true);
            router.push({ query: { offerId: offerInfo.id }}, undefined, { shallow: true });
        }
    }, [router.query.propertyId, offerInfo, router, hasVisitedOffer]);


    const groupOptions = groups.map((group: GroupWithMembersModel) => {
        return {
            value: group.group.id,
            label: `${he.decode(group.group.name)} (${group.members.length} ${group.members.length === 1 ? 'member' : 'members'})`
        }
    });
    const handleOpenNewTab = () => {
        const newPath = `/buy/mortgage?groupId=${selectedGroup?.group?.id}`;
        const fullUrl = window.location.origin + newPath;
        window.open(fullUrl, '_blank');
    };

    const findOrCreateOffer = async (event?: React.MouseEvent<HTMLButtonElement>) => {
        if (event) {
            event.preventDefault()
        }
        if (!selectedGroup) {
            return;
        }
        try {
            const offerResponse  = await makeAuthedApiRequest({method: 'post', data: {propertyId: props.propertyInfo.id, groupId: selectedGroup?.group?.id}, urlExtension: '/v1/offer/findOrCreateOffer'});
            const offerInfo = await offerResponse.data as OfferModel;
            setOfferInfo(offerInfo);
            setCurrentStep(userState.user?.userType === 'agent' ? 3 : 2)
            setSelectedIndex(offerInfo?.stepFiveComplete ? 5 : offerInfo?.stepFourComplete ? 5 : offerInfo?.stepThreeComplete ? 4 : offerInfo?.stepTwoComplete ? 3 : props.offerInfo?.stepOneComplete ? 2 : 1)
        } catch (error) {
            setError('Error');
        }
    }
    if (error) {
        return <ContentParent><StyledContentDiv>
            <StatusMessage hasIcon><MintParagraph size={"18"} weight={"medium"}>There was an error performing your previous action</MintParagraph></StatusMessage>
            <div style={{display: 'flex', marginBottom:'48px', justifyContent: 'space-between'}}>
            <SecondaryButton reverseArrow isLight hasArrow size='medium' style={{marginTop:'32px'}} text='Go Back' onClick={() => router.back()}></SecondaryButton><div></div>
            </div>
        </StyledContentDiv></ContentParent>

    }

    if (currentStep === 0) {
        return <OnboardingScreenFrame prevOnClick={() => {setOfferInfo(undefined); router.back()}} nextOnClick={() => setCurrentStep(1)} removeBorder>
            {userState.user?.userType === 'agent' ? <>
                <H6 style={{color: colors.gray900, marginTop: '24px'}}>Please make sure everyone who will be on this offer is signed up and in your group</H6>
                <StatusMessage style={{ margin: "8px 0 8px 0" }} hasIcon>
                        <MintParagraph size={"14"} weight={"medium"}>Hi Agents — Housewell uses our own tool for making offers on your client&apos;s behalf, we modeled it after standard Purchase Agreements in the industry so they should be familiar. 
                        We suggest using our offer tool because our sellers prefer it, it only takes a few minutes to prepare an offer, and it&apos;s completely free! </MintParagraph>
                    </StatusMessage>
            </>:
            <>
            
            <H2 style={{color: colors.gray900}}>Make a legal offer in minutes with Housewell:</H2>
            <H6 style={{color: colors.gray900, marginTop: '24px'}}><span style={{color: colors.brightgreen1300}}> 1.</span> Make sure everyone who is going to be on this offer is signed up for Housewell and in your group. You can invite people to your group in settings.</H6>
            <H6 style={{color: colors.gray900, marginTop: '24px'}}><span style={{color: colors.brightgreen1300}}> 2.</span> Reach out to the sellers to see what they&apos;re looking for in an offer.</H6>
            <H6 style={{color: colors.gray900, marginTop: '24px'}}><span style={{color: colors.brightgreen1300}}> 3.</span> Use our offer builder tool to make a legal offer for you in minutes. Fill out the fields and we prepare a Purchase Agreement that we can easily send for esign on your behalf. It&apos;s a bit like using your favorite tax prep software.</H6>
            <H6 style={{color: colors.gray900, marginTop: '24px'}}><span style={{color: colors.brightgreen1300}}> 4.</span> Once you create your offer, you&apos;ll be able to see the Purchase Agreement in your dashboard and we&apos;ll help you through the rest of the process.</H6>
            <StatusMessage style={{marginTop: '24px', marginBottom:"24px"}} hasIcon> <MintParagraph size={"14"} weight={"medium"}>Note: using the Offer Builder doesn&apos;t imply an agency relationship with Housewell. You are responsible for advocating for your own interests in all matters, Housewell&apos;s role is limited to explaining basic terms and preparing documents. We recommend consulting an attorney before signing any documents.</MintParagraph></StatusMessage></>}
        </OnboardingScreenFrame>
    }

    if (currentStep === 1) {
        return (<OnboardingScreenFrame prevOnClick={() => setCurrentStep(0)} nextOnClick={findOrCreateOffer} removeBorder>
                <MintParagraph size={"20"} weight={"medium"}
                            style={{margin: "0px 0 24px 0"}}>{`Choose your group for this offer:`}</MintParagraph>
                <Select
                    styles={customStyles}
                    value={groupOptions.find((group) => selectedGroup?.group && selectedGroup.group.id === group.value)}
                    isLoading={groups.length === 0}
                    isSearchable={true}
                    name="select-group-offer"
                    options={groupOptions}
                    onChange={(selectedOption) => setSelectedGroup(groups.find((group) => group.group.id === selectedOption?.value))}
                />
                <StatusMessage style={{marginTop: '24px'}} hasIcon> <MintParagraph size={"16"} weight={"medium"}>You&apos;ll choose which group members are on the offer later.</MintParagraph></StatusMessage>
            </OnboardingScreenFrame>)
    }

    if (currentStep === 2) {
        if (selectedGroup?.group.loanApplicationId) {
            setCurrentStep(3);
        }
        return <OnboardingScreenFrame prevOnClick={() => setCurrentStep(1)} nextOnClick={selectedMortgageOptionIndex === 0 ? handleOpenNewTab : () => setCurrentStep(3)} removeBorder>
            {isMobile ? <H4 style={{color: colors.gray900, marginBottom: '32px'}}>Would you like to apply for a mortgage through Housewell?</H4> : <H2 style={{color: colors.gray900, marginBottom: '32px'}}>Would you like to apply for a mortgage through the Housewell platform?</H2>}
            <DarkStatusMessage hasIcon>
            <div style={{display:'flex', flexDirection:'column', justifyContent: 'flex-start'}}><MintParagraph style={{marginTop:'2px'}} size={"20"} weight={"medium"}>Why apply for a mortgage through Housewell</MintParagraph>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', paddingRight: '30px' }}>
                <li>
                <MintParagraph size={"16"} weight={"medium"} style={{color: 'white', lineHeight: '24px'}}>Receive a generous rebate at closing—get .6% of the loan size back (e.g., when closing a $500,000 mortgage you will receive an additional $3,000 rebate toward your closing costs)</MintParagraph>
                </li>
                <li>
                <MintParagraph size={"16"} weight={"regular"} style={{color: 'white', lineHeight: '24px'}}>Apply 100% online and get pre-approved in minutes—a pre-approval is a must for many sellers</MintParagraph>
                </li>
                <li>
                <MintParagraph size={"16"} weight={"regular"} style={{color: 'white', lineHeight: '24px'}}>Competitive rates—<Link href="https://pylonlending.notion.site/Rate-Match-Terms-Conditions-43f03499af9141948cede3e3a0458026" style={{fontWeight: 'bold', textDecoration: 'underline'}}>rate matching available</Link> upon request</MintParagraph>
                </li>
                <li>
                <MintParagraph size={"16"} weight={"regular"} style={{color: 'white', lineHeight: '24px'}}>No origination fee</MintParagraph>
                </li>
            </ul>
            </div>
            </DarkStatusMessage>
            <MultipleChoiceParent childIndex={0} child={<StatusMessage hasIcon> <MintParagraph size={"14"} weight={"medium"}><span style={{fontWeight: '600'}}>Recommended</span> Your offer is more likely to be accepted if you have a preapproval letter</MintParagraph></StatusMessage>} style={{marginTop:'40px', marginBottom:'20px'}} fontSize='20' useChecks selectedIndex={selectedMortgageOptionIndex} onSelection={(index) => setSelectedMortgageOptionIndex(index)} choices={[{ text: `Yes, I'd like to apply now` }, { text: `Yes, I'd like to apply after submitting an offer` }, { text: `No, take me to the build an offer` } ]}></MultipleChoiceParent>
            <MintParagraph size='11' weight='regular' style={{color:colors.gray600}}>Housewell Technologies, Inc. is not a lender. All loan products and financial services are provided by Embed Inc. d/b/a Pylon Lending, Pylon, NMLS# 2324627 (“Pylon”), a non-affiliated mortgage lender. You are not required to use Pylon for your mortgage needs and may be able to obtain lower rates or fees through a different lender. All communications and information sharing that occurs through the mortgage application process are between you and Pylon. This is not a commitment to lend. All offers are subject to submitting a complete loan application and obtaining a full underwriting approval. Loan terms are subject to change. Only the most qualified applicants will be approved for Pylon’s lowest rates. Not available in all states. <Link href='https://www.nmlsconsumeraccess.org/TuringTestPage.aspx?ReturnUrl=/EntityDetails.aspx/COMPANY/2324627'>NMLS Consumer Access.</Link> Equal Housing Lender.</MintParagraph>
        </OnboardingScreenFrame>
    }


    return (props.propertyInfo && offerInfo && currentStep === 3 ?
            <>
            <AuthNav />
            <MakeOfferFrame offerInfo={offerInfo} propertyInfo={props.propertyInfo} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}
                            // @ts-ignore todo: fix TS error w/ ref not having save()
                            save={() => childRef.current && childRef.current.save()} >
                {selectedIndex === 1 && <MakeOfferPage ref={childRef} propertyInfo={props.propertyInfo} offerInfo={offerInfo as OfferModel} setOfferInfo={setOfferInfo}/>}
                {selectedIndex === 2 && <MakeOfferPropDetailsPage ref={childRef} propertyInfo={props.propertyInfo} offerInfo={offerInfo as OfferModel} setOfferInfo={setOfferInfo}/>}
                {selectedIndex === 3 && <MakeOfferContiPage ref={childRef} propertyInfo={props.propertyInfo} offerInfo={offerInfo as OfferModel} setOfferInfo={setOfferInfo}/>}
                {selectedIndex === 4 && <MakeOfferDatesPage ref={childRef} propertyInfo={props.propertyInfo} offerInfo={offerInfo as OfferModel} setOfferInfo={setOfferInfo}/>}
                {selectedIndex === 5 && <MakeOfferReviewPage ref={childRef} propertyInfo={props.propertyInfo} offerInfo={offerInfo as OfferModel} setSelectedIndex={setSelectedIndex} />}
            </MakeOfferFrame>
            </>
            :
            // todo: better error handling
            <>
            <div style={{ paddingTop: "64px", display: "flex", justifyContent: "center", width: "100%" }}>
                <MintParagraph size={"24"} weight={"bold"}>Data not found. Please check URL and internet connection and try again.</MintParagraph>
            </div>
            </>
    )
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
    try {
        const { req, res } = context;
        const { offerId, propertyId } = context.query;
        if (offerId) {
            const offerResponse = await makeAuthedApiRequest({
                method: 'post',
                data: { id: offerId },
                urlExtension: '/v1/offer/getOffer',
                isServer: true, req, res
            });
            const offerInfo = await offerResponse.data as OfferModel;
            const propertyResponse = await makeAuthedApiRequest({
                method: 'post',
                data: { propertyId: offerInfo.propertyId },
                urlExtension: '/v1/property/propertyInfo',
                isServer: true, req, res
            });
            const propertyInfo = await propertyResponse.data.property as PropertyModel;
            return (propertyResponse && offerInfo) ? { props: { propertyInfo: propertyInfo, offerInfo: offerInfo as OfferModel } } : { props: {}};
        } else if (propertyId) {
            const propertyResponse = await makeAuthedApiRequest({
                method: 'post',
                data: { propertyId },
                urlExtension: '/v1/property/propertyInfo',
                isServer: true, req, res
            });
            const propertyInfo = await propertyResponse.data.property  as PropertyModel;
            return (propertyResponse ) ? { props: { propertyInfo: propertyInfo } } : { props: {}};
        }
        return { props: { } };
    } catch (error) {
        console.log("ERROR", error);
        return { props: { } };
    }
}

export default OfferMainPage;