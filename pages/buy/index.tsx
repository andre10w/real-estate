import React, { useEffect } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';
import { useAppDispatch, useAppSelector, initializeStore } from "../../src/store";
import { fetchEvents } from "../../src/slices/events";
import { GroupWithMembersModel, fetchUserGroups, GroupModel } from "../../src/slices/groups";
import { fetchOffersByBuyerGroupId } from '../../src/slices/offers';
import { fetchLikedProperties, deleteLikedProperty } from '../../src/slices/likedProperties';
import { H6, H5, AzeretMonoParagraph, MintParagraph } from "../../src/components/Typography/Typography";
import { colors } from '../../src/styles/colors';
import { useDevice } from '../../src/contexts/DeviceContext';
import FancyEventCard from '../../src/components/events/FancyEventCard';
import PropertyCard from '../../src/components/boxes/buyerDash/PropertyCard';
import styled from '@emotion/styled';
import Image from 'next/image';
import SecondaryButton from '../../src/components/buttons/SecondaryButton';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { GetServerSidePropsContext } from 'next';
import { customStyles } from '../../src/constants';
import { makeAuthedApiRequest } from '../../src/utils/api/apiHelper';
import Select from "react-select";
import he from 'he'
import { LoanApplicationStatuses } from './mortgage';


dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const formatDate = (utcDate: Date) => {
    return dayjs.utc(utcDate, 'YYYY-MM-DD HH:mm:ss').local().format('MMMM D, YYYY h:mma');
};


const HeartButtonBackground = styled.div`
    display: flex;
    width: 36px;
    height: 36px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background-color: ${colors.darkgreen1000};
    cursor: pointer;

    &:hover {
        background-color: ${colors.darkgreen900};
    }

    &:active {
        background-color: ${colors.darkgreen800};
    }
`;

const OfferCardUnderBar = styled.div`
    width: 100%;
    display: flex;
    padding: 12px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    background-color: ${colors.gray100};
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    box-sizing: border-box;
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
    border-radius: 16px;
    border: 1px solid ${colors.gray200};
    height: 200px;
    text-align: center;
`;

const PlaceholderContainer = styled.div`
    border: 1px solid ${colors.gray300};
    border-radius: 12px;
    margin-top: 20px;
    display: flex;
    padding: 0 20px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const ParentContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
    border-radius: 16px;
`;

const ImageContainer = styled.div`
    width: 100%;
    overflow: hidden;
    position: relative;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    padding-top: calc(1 / 2 * 100%);

    img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const TextContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid ${colors.gray200};
    border-top: none;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    width: 100%;
    box-sizing: border-box;
    padding: 40px;
`;



const Dashboard = () => {
    function getLoanButtonText(loanApplicationStatus: LoanApplicationStatuses, group: GroupModel, isMobile: boolean): string {
        if (loanApplicationStatus === 'UNKNOWN') {
            if (group.hasStartedLoanApp) {
                return isMobile ? 'Continue' : 'Continue Application';
            } else {
                return 'Apply now';
            }
        } else if (loanApplicationStatus === 'PREAPPROVED' || loanApplicationStatus === 'SUBMITTED') {
            return isMobile ? 'Dashboard' : 'Mortgage dashboard';
        } else {
            return 'Apply now';
        }
    }

    const { isMobile, windowSize } = useDevice();
    const removeAddressDetail = windowSize.width < 1135;
    const router = useRouter();
    const dispatch = useAppDispatch();
    const events = useAppSelector((state) => state.eventReducer.events);
    const likedProperties = useAppSelector((state) => state.likedPropertiesReducer.likedProperties);
    const groups = useAppSelector((state) => state.groupsReducer.groups);
    const user = useAppSelector((state) => state.userReducer.user);
    const offers = useAppSelector((state) => state.offersReducer.offersForSelectedGroup);
    const [loanApplicationStatus, setLoanApplicationStatus] = React.useState<LoanApplicationStatuses>('UNKNOWN');
    const [maxPreapprovalAmount, setMaxPreapprovalAmount] = React.useState<number>(0);
    const [selectedGroup, setSelectedGroup] = React.useState(groups[0]);
    const [loanButtonText, setLoanButtonText] = React.useState(getLoanButtonText(loanApplicationStatus, selectedGroup.group, isMobile));
    const handleLoanButtonClick = () => {
        const urlWithGroupId = `/buy/mortgage?groupId=${selectedGroup?.group?.id}`;
        router.push(urlWithGroupId);
    }

    const removeLikedProperty = (propertyId: string) => {
        dispatch(deleteLikedProperty(propertyId));
    }
    useEffect(() => {
        const getLoanApplicationsForGroup = async () => {
            try {
                if (!selectedGroup?.group?.id) {
                    return;
                }
                const data = {
                    groupId: selectedGroup?.group.id,
                }
                if (!selectedGroup.group.loanApplicationId) {
                    setLoanApplicationStatus('UNKNOWN');
                    setMaxPreapprovalAmount(0);
                    setLoanButtonText(getLoanButtonText('UNKNOWN', selectedGroup.group, isMobile));
                    return;
                }

                const response = await makeAuthedApiRequest({ method: 'post', urlExtension: `/v1/pylon/getGroupLoanApplication`, data });
                const status: LoanApplicationStatuses = !!response?.data?.status?.cancellation_date ? 'CANCELLED' : !!response?.data?.status?.preapproval_date ? 'PREAPPROVED' : !!response?.data?.status?.application_submitted_date ? 'SUBMITTED' : 'UNKNOWN';
                setMaxPreapprovalAmount(response.data.max_preapproved_purchase_price);
                setLoanButtonText(getLoanButtonText(status, selectedGroup.group, isMobile));
                setLoanApplicationStatus(status);
            } catch (error) {
                console.log(error);
            }
        }

        getLoanApplicationsForGroup();
    }, [selectedGroup?.group?.id, selectedGroup.group.loanApplicationId, selectedGroup.group, isMobile]);

    useEffect(() => {
        if (groups && groups.length > 0) {
            setSelectedGroup(groups[0]);
        }
    }, [groups]);

    useEffect(() => {
        if (selectedGroup) {
            dispatch(fetchOffersByBuyerGroupId(selectedGroup.group.id));
        }
    }, [selectedGroup, dispatch]);

    const groupOptions = groups.map((group: GroupWithMembersModel) => {
        return {
            value: group.group.id,
            label: `${he.decode(group.group.name)} (${group.members.length} ${group.members.length === 1 ? 'member' : 'members'})`
        }
    });


    return (
        <div>
            <div style={{ flexDirection: 'row', padding: isMobile ? '10px 2%' : "10px 5%", boxSizing: 'border-box', width: '100%', height: '72px', boxShadow: '0px 0px 0px 0px rgba(179, 185, 179, 0.08), 0px 3px 7px 0px rgba(179, 185, 179, 0.08), 0px 13px 13px 0px rgba(179, 185, 179, 0.07), 0px 29px 17px 0px rgba(179, 185, 179, 0.04), 0px 51px 20px 0px rgba(179, 185, 179, 0.01), 0px 80px 22px 0px rgba(179, 185, 179, 0.00)', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                <Select
                    styles={customStyles}
                    value={groupOptions.find((group) => selectedGroup?.group && selectedGroup.group.id === group.value)}
                    isLoading={groups.length === 0}
                    isSearchable={true}
                    name="select-group-offer"
                    options={groupOptions}
                    onChange={(selectedOption) => { setSelectedGroup(groups.find((group) => group.group.id === selectedOption?.value)) }}
                /><SecondaryButton onClick={() => router.push('buy/map')} style={{ width: isMobile ? '60px' : '245px', paddingLeft: 'auto', paddingRight: 'auto', height: '42px', borderRadius: '6px', color: colors.gray1000 }} size={'medium'} hasArrow={!isMobile} isLight text={isMobile ? "Map" : 'View all properties'} />
            </div>
            <div style={{ margin: "0 6%", justifyContent: 'space-between', display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
                <div style={{ width: isMobile ? '100%' : "56%", display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <H6 style={{ paddingBottom: 0, marginTop: '20px' }}>Offers</H6>
                    {offers.length === 0 ?
                        <EmptyStateContainer style={{ marginTop: '20px' }}>
                            <MintParagraph size='16' weight='medium' style={{ color: colors.gray700 }}>This group hasn&apos;t submitted any offers yet</MintParagraph>
                        </EmptyStateContainer>
                        : offers.map((offer) => {
                            return (
                                <>
                                    <div key={`div_${offer.id}`} style={{ height: '20px' }}></div>
                                    <PropertyCard offerContext key={offer.id} property={offer.property} removeAddressDetail={removeAddressDetail} isMobile={isMobile}>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: "space-between", height: '100%', alignItems: 'flex-end' }}>
                                            <SecondaryButton text={isMobile ? 'View' : "View Offer"} size={removeAddressDetail ? 'small' : 'medium'} isLight onClick={() => router.push(`make-offer?offerId=${offer.id}`)} hasArrow style={{ width: isMobile ? '90px' : removeAddressDetail ? '145px' : '175px', marginTop: '12px' }}></SecondaryButton>
                                            <MintParagraph size='14' weight='medium' style={{ width: '100%', textAlign: 'right', color: colors.gray700, marginTop: '20px', marginBottom: '20px' }}>
                                                {offer.expiryDate ? `Expires: ${formatDate(offer.expiryDate)}` : ''}
                                            </MintParagraph>
                                        </div>
                                    </PropertyCard>
                                    <OfferCardUnderBar>{offer.offerAmt ? <MintParagraph size='16' weight='medium'>
                                        <span style={{ color: colors.gray700 }}>You offered</span> {`$${parseFloat(offer.offerAmt.toString()).toLocaleString()}`}
                                    </MintParagraph> :
                                        <MintParagraph size='16' weight='medium'>Price Not Set</MintParagraph>}
                                        <AzeretMonoParagraph weight="medium" style={{ padding: '6px 12px', borderRadius: '38px', backgroundColor: colors.gray200, fontSize: '12px', color: colors.darkgreen1000 }}>PENDING APPROVAL</AzeretMonoParagraph>
                                    </OfferCardUnderBar>
                                </>
                            )
                        })}
                    <H6 style={{ marginTop: '30px' }} >Favorites</H6>
                    {likedProperties.length === 0 ?
                        <PlaceholderContainer style={{ height: isMobile ? '400px' : '460px', textAlign: 'center' }}>
                            <Image src='/home_placeholder.svg' alt="house placeholder image" width={165} height={164} />
                            <MintParagraph size="24" weight={"medium"}>Find and buy your new home—faster than ever</MintParagraph>
                            <MintParagraph size="16" weight={"medium"} style={{ marginTop: "12px", color: colors.gray800 }}>Get your dream home, without all the stress</MintParagraph>
                            <SecondaryButton onClick={() => router.push('buy/map')} style={{ width: isMobile ? '250px' : "290px", height: isMobile ? '58px' : "64px", marginTop: "40px" }} size={isMobile ? 'medium' : "large"} hasArrow text={"Discover homes"} />
                        </PlaceholderContainer>
                        : likedProperties.map((likedProperty) => {
                            return (
                                <>
                                    <div key={`div_${likedProperty.id}`} style={{ height: '20px' }}></div>
                                    <PropertyCard key={likedProperty.id} property={likedProperty.property} isMobile={isMobile}> <HeartButtonBackground onClick={() => removeLikedProperty(likedProperty.propertyId)}><Image src={'/icon_svg/heart.svg'} alt='ht' height={22.5} width={22.5} /></HeartButtonBackground></PropertyCard>
                                </>
                            )
                        })}
                </div>
                <div style={{ width: isMobile ? '100%' : "40%", display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <H6 style={{ marginTop: isMobile ? '0' : '20px' }}>Financing</H6>
                    {user?.userType === 'agent' ?
                        <ParentContainer>
                            <ImageContainer>
                                <img src="/mortgage_cover.png" alt="Example" />
                            </ImageContainer>
                            <TextContainer>
                                {<H5>If your clients apply for their mortgage through Housewell they receive up to an additional <span style={{ color: colors.orange1000 }}>$6000 rebate when they close.</span></H5>}
                                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '24px' }}>
                                    <li>
                                        <MintParagraph size={"16"} weight={"regular"} style={{ color: colors.gray700, lineHeight: '24px', marginTop: '5px' }}>Receive .6% of the loan size back as a rebate at closing (e.g., when closing a $1,000,000 mortgage you will receive an additional $6,000 rebate toward your closing costs)</MintParagraph>
                                    </li>
                                    <li>
                                        <MintParagraph size={"16"} weight={"regular"} style={{ color: colors.gray700, lineHeight: '24px', marginTop: '5px' }}>Apply 100% online and get pre-approved in minutes</MintParagraph>
                                    </li>
                                    <li>
                                        <MintParagraph size={"16"} weight={"regular"} style={{ color: colors.gray700, lineHeight: '24px', marginTop: '5px' }}>Competitive rates—<Link href="https://pylonlending.notion.site/Rate-Match-Terms-Conditions-43f03499af9141948cede3e3a0458026" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>rate matching available</Link> upon request</MintParagraph>
                                    </li>
                                    <li>
                                        <MintParagraph size={"16"} weight={"regular"} style={{ color: colors.gray700, lineHeight: '24px', marginTop: '5px' }}>No origination fee</MintParagraph>
                                    </li>
                                </ul>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <div></div><SecondaryButton onClick={() => router.push('buy/mortgage')} style={{ marginTop: "40px" }} size={'medium'} hasArrow text={"Go to mortgage"} />
                                </div>

                            </TextContainer>
                        </ParentContainer> :
                        <ParentContainer>
                            <ImageContainer>
                                <img src="/mortgage_cover.png" alt="Example" />
                            </ImageContainer>
                            <TextContainer>
                                {loanApplicationStatus === "PREAPPROVED" && <div style={{ width: '100%', padding: '8px 0', borderBottom: `1px solid ${colors.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <AzeretMonoParagraph weight='regular' style={{ fontSize: '16px' }}>HOUSEWELL MORTGAGE</AzeretMonoParagraph>
                                    <AzeretMonoParagraph weight="regular" style={{ padding: '6px 12px', borderRadius: '38px', backgroundColor: colors.brightgreen1000, fontSize: isMobile ? '10px' : '12px', color: colors.darkgreen1000 }}>PRE-APPROVED</AzeretMonoParagraph>
                                </div>}
                                {loanApplicationStatus === "CANCELLED" && <div style={{ width: '100%', padding: '8px 0', borderBottom: `1px solid ${colors.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <AzeretMonoParagraph weight='regular' style={{ fontSize: '16px' }}>HOUSEWELL MORTGAGE</AzeretMonoParagraph>
                                    <AzeretMonoParagraph weight="regular" style={{ padding: '6px 12px', borderRadius: '38px', backgroundColor: colors.gray200, fontSize: isMobile ? '10px' : '12px', color: colors.darkgreen1000 }}>CANCELLED</AzeretMonoParagraph>
                                </div>}
                                {loanApplicationStatus === "SUBMITTED" && <div style={{ width: '100%', padding: '8px 0', borderBottom: `1px solid ${colors.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <AzeretMonoParagraph weight='regular' style={{ fontSize: '16px' }}>HOUSEWELL MORTGAGE</AzeretMonoParagraph>
                                    <AzeretMonoParagraph weight="regular" style={{ padding: '6px 12px', borderRadius: '38px', backgroundColor: colors.gray200, fontSize: isMobile ? '10px' : '12px', color: colors.darkgreen1000 }}>SUBMITTED</AzeretMonoParagraph>
                                </div>}
                                {loanApplicationStatus === "PREAPPROVED" && <MintParagraph style={{ marginBottom: '12px', width: '100%', textAlign: 'left', color: colors.brandMedGreen }} size='20' weight='regular'>{`Congrats ${user?.firstName || ''}!`}</MintParagraph>}
                                {
                                    loanApplicationStatus === 'UNKNOWN' ? selectedGroup.group.hasStartedLoanApp ? <H5> Continue where you left off, get a mortgage through Housewell and receive up to an additional <span style={{ color: colors.orange1000 }}>$6000 rebate when you close.</span></H5> : <H5>Get a mortgage through Housewell and receive up to an additional <span style={{ color: colors.orange1000 }}>$6000 rebate when you close.</span></H5> :
                                        loanApplicationStatus === 'CANCELLED' ? <H5>You&apos;re loan application has been cancelled. Please reach out to us.</H5> :
                                            loanApplicationStatus === 'PREAPPROVED' ? <H5>You&apos;re pre-approved for a mortgage on a home up to <span style={{ color: colors.brandMedGreen }}>{`$${maxPreapprovalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}</span></H5> :
                                                loanApplicationStatus === 'SUBMITTED' ? <H5>Your application has been submitted but we need a little more information before you&apos;re pre-approved.</H5> :
                                                    <H5>Get a mortgage through Housewell and receive up to an additional <span style={{ color: colors.orange1000 }}>$6000 rebate when you close.</span></H5>
                                }
                                {loanApplicationStatus === 'UNKNOWN' && <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '24px' }}>
                                    <li>
                                        <MintParagraph size={"16"} weight={"regular"} style={{ color: colors.gray700, lineHeight: '24px', marginTop: '5px' }}>Receive .6% of the loan size back as a rebate at closing (e.g., when closing a $1,000,000 mortgage you will receive an additional $6,000 rebate toward your closing costs)</MintParagraph>
                                    </li>
                                    <li>
                                        <MintParagraph size={"16"} weight={"regular"} style={{ color: colors.gray700, lineHeight: '24px', marginTop: '5px' }}>Apply 100% online and get pre-approved in minutes</MintParagraph>
                                    </li>
                                    <li>
                                        <MintParagraph size={"16"} weight={"regular"} style={{ color: colors.gray700, lineHeight: '24px', marginTop: '5px' }}>Competitive rates—<Link href="https://pylonlending.notion.site/Rate-Match-Terms-Conditions-43f03499af9141948cede3e3a0458026" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>rate matching available</Link> upon request</MintParagraph>
                                    </li>
                                    <li>
                                        <MintParagraph size={"16"} weight={"regular"} style={{ color: colors.gray700, lineHeight: '24px', marginTop: '5px' }}>No origination fee</MintParagraph>
                                    </li>
                                </ul>}
                                {loanApplicationStatus === 'CANCELLED' && <MintParagraph size='14' weight='regular' style={{ color: colors.gray800, width: '100%', marginTop: '14px' }}>Please email support@housewell.com for assistance if you&apos;d like to submit another application or don&apos;t know why this application was cancelled</MintParagraph>}
                                {loanApplicationStatus === 'SUBMITTED' && <MintParagraph size='14' weight='regular' style={{ color: colors.gray800, width: '100%', marginTop: '14px' }}>In the meantime, fill out missing fields on the mortgage dashboard.</MintParagraph>}

                                {loanApplicationStatus !== 'CANCELLED' && <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <SecondaryButton onClick={handleLoanButtonClick} style={{ marginTop: "40px", width: '100%' }} size={'medium'} hasArrow text={loanButtonText} />
                                </div>}

                            </TextContainer>
                        </ParentContainer>
                    }
                    <H6 style={{ marginTop: '24px' }} >Tours</H6>
                    {events.length === 0 ?
                        <EmptyStateContainer style={{ marginTop: '20px' }}>
                            <MintParagraph size='16' weight='medium' style={{ color: colors.gray700 }}>You haven&apos;t scheduled any tours yet</MintParagraph>
                        </EmptyStateContainer>
                        : events.map((event) => {
                            return (
                                <>
                                    <div key={`div_${event.id}`} style={{ height: '20px' }}></div>
                                    <FancyEventCard key={event.id} event={event} isMobile={removeAddressDetail} />
                                </>
                            )
                        })}
                </div>
            </div>
            <MintParagraph size='11' weight='regular' style={{ color: colors.gray600, margin: "50px 6%" }}>Housewell Technologies, Inc. is not a lender. All loan products and financial services are provided by Embed Inc. d/b/a Pylon Lending, Pylon, NMLS# 2324627 (“Pylon”), a non-affiliated mortgage lender. You are not required to use Pylon for your mortgage needs and may be able to obtain lower rates or fees through a different lender. All communications and information sharing that occurs through the mortgage application process are between you and Pylon. This is not a commitment to lend. All offers are subject to submitting a complete loan application and obtaining a full underwriting approval. Loan terms are subject to change. Only the most qualified applicants will be approved for Pylon’s lowest rates. Not available in all states. <Link href='https://www.nmlsconsumeraccess.org/TuringTestPage.aspx?ReturnUrl=/EntityDetails.aspx/COMPANY/2324627'>NMLS Consumer Access.</Link> Equal Housing Lender.</MintParagraph>

        </div>
    )
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
    try {
        // Fetch the data for properties
        const store = initializeStore();
        await Promise.all([
            store.dispatch(fetchEvents({ isServer: true, req: context.req, res: context.res })),
            store.dispatch(fetchUserGroups({ isServer: true, req: context.req, res: context.res })),
            store.dispatch(fetchLikedProperties({ isServer: true, req: context.req, res: context.res }))
        ]);
        const { offersReducer, eventReducer, groupsReducer } = store.getState();
        return { props: { initialState: { offersReducer, eventReducer, groupsReducer } } };
    } catch (error) {
        console.log("ERROR", error);
        return { props: { basicAddressData: false } };
    }
}

export default Dashboard;