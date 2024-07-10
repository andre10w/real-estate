import {useRouter} from "next/router";
import styled from "@emotion/styled";
import SecondaryButton from "../../src/components/buttons/SecondaryButton";
import { OfferTypeBadge} from "../../src/components/property-admin/OffersTab";
import { fetchOffersByPropertyId } from "../../src/slices/offers";
import numeral from "numeral";
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../src/store";
import {fetchProperties} from "../../src/slices/properties";
import {makeAuthedApiRequest} from "../../src/utils/api/apiHelper";
import { AzeretMonoParagraph, MintParagraph } from "../../src/components/Typography/Typography";
import { colors } from "../../src/styles/colors";
import DiffAndIcon from "../../src/components/stuff/DiffAndIcon";
import LoadingSpinner from '../../src/components/stuff/LoadingSpinner'
import { useDevice } from "../../src/contexts/DeviceContext";
import { OfferReviewLine } from "../../src/components/make-offer/MakeOfferReviewPage";
import { OfferModel } from "../../src/models/offerModel";
import { MOPSubcontainer, MOPHeader } from "../../src/components/make-offer/MakeOfferPageComponents";

const MOPHeaderBtnContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;


const OfferHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 92px;
    padding: 0 20px;
    border-bottom: 1px solid #CACFCA;
`

const ContentContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 24px 24px;
    background-color: white;
    border-radius: 12px;
    width: 100%;
    max-width: 900px;
`;

const ContentBackground = styled.div`
    display: flex;
    justify-content: center;
    padding-top: 40px;
    padding-left: 15px;
    padding-right: 15px;
    padding-bottom: 40px;
    background-color: ${colors.gray100};
`



const StyledSecondaryButtonDecline = styled(SecondaryButton)`
    color: ${colors.redError};
    background-color: #FDEAEA;
    border: none;
    &:hover {
        color: ${colors.redError};
        background-color: #FCD3D3;
        border: none;
    }
    
    &:active {
        color: ${colors.redError};
        background-color: #FABBBB;
        border: none;
    }
`;

const StyledSecondaryButtonAccept = styled(SecondaryButton)`
    color: ${colors.darkgreen1000};
    background-color: ${colors.brightgreen200};
    border: none;
    &:hover {
        color: ${colors.darkgreen1000};
        background-color: #D8EAD9;
        border: none;
    }
    
    &:active {
        color: ${colors.darkgreen1000};
        background-color: #C6E6C4;
        border: none;
    }
`;


async function acceptOffer(offerId: string) {
    // todo: better confirm?
    const result = window.confirm('Are you sure you want to accept this offer?');
    if (result) {
        const response = await makeAuthedApiRequest({
            method: 'post',
            urlExtension: '/v1/purchaseAgreements/acceptPurchaseAgreement',
            data: {id: offerId}
        });
        console.log(response);
        // todo: handle error and success
    }
}

const formatMoney = (value?: number) => {
    if (!value) return "$0"
    return numeral(value).format('$0,0');
}

const createContingenciesSection = (offerInfo: OfferModel) => {
    const contingencies = [
        { title: "Inspection Contingency", condition: offerInfo.inspectionCont },
        { title: "Financing Contingency", condition: offerInfo.financingCont },
        { title: "Appraisal Gap Contingency", condition: offerInfo.appraisalCont },
        { title: "Temporary Occupancy Contingency", condition: offerInfo.tempOccCont }
    ];

    const array: JSX.Element[] = [];
    contingencies.forEach(((value, index) => {
        if (value.condition) array.push(<OfferReviewLine title={value.title} body={"Added"} noBorder={index === contingencies.length - 1}/>)
    }))

    if (array.length > 0) {
        array[array.length - 1] = React.cloneElement(array[array.length - 1], {noBorder: true});
    }

    return array;
}

const OfferDetailsPage = () => {
    const router = useRouter();
    const { offerId, propertyId } = router.query;


    const offers = useAppSelector((state) => state.offersReducer.offersByProperty);
    const properties = useAppSelector((state) => state.propertiesReducer.properties);
    const { isMobile } = useDevice();
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(fetchOffersByPropertyId({propertyId: propertyId as string})); 
        dispatch(fetchProperties({}));
    }, [dispatch, propertyId, offerId]);
    const offer: OfferModel = offers[propertyId as string] ? offers[propertyId as string].find(a => a.id === offerId) : null
    const property = properties[propertyId as string]

    if (!offer || !property) {
        return <LoadingSpinner/>; // Better loading component
    }
    const address2String = property.address2 ? property.address2 + ' ' : '';
    const printIcon = '/icon_svg/printer.svg'
    const downloadIcon = '/icon_svg/download.svg'
    const declineIcon = '/icon_svg/decline.svg'
    const checkIcon = '/icon_svg/check.svg'
    const messageIcon = '/icon_svg/sms_edit.svg'

    const offerPrice = numeral(offer.offerAmt);
    const listingPrice = numeral(property.listPrice);
    const type = offer.financingType === "CASH" ? "ALL CASH" : offer.loanType === "FHA" || offer.loanType === "VA" ? "FHA/VA" : "CONVENTIONAL";
    const addressData = property.city + ', ' + property.state + ' ' + property.zip;

    const downPaymentPercent = (offer.downPaymentAmt && offer.offerAmt) 
    ? Math.round((offer.downPaymentAmt / offer.offerAmt) * 10000) / 100
    : 0;   
    const contingenciesChildren = createContingenciesSection(offer);
    const dueDiligenceDate = dayjs(offer.dueDiligenceDate);
    const closingDate = dayjs(offer.closingDate);
    const possessionDate = dayjs(offer.possessionDate);
    const expiryDate = dayjs(offer.expiryDate);

    const housewellFee = 1499;
    const realtorFee = offerPrice.value() as number * (offer.buyerSideCommission! / 100);
    const fmlsFee = offerPrice.value() as number * 0.0012;
    const closingCostContribution = numeral(offer.sellerClosingAmt).value() as number;
    const sumDeductions = housewellFee + realtorFee + fmlsFee + closingCostContribution;
    const netToSeller = (offerPrice.value() as number) - sumDeductions;


    return <div>
        <OfferHeader style={{height: isMobile ? '70px': '92px'}}>
            <div style={{display:'flex'}}><SecondaryButton size='medium' hasArrow isLight borderless reverseArrow text={"Back"} style={{}} onClick={() => router.push(`/property-admin?propertyId=${offer.propertyId}`)} /><div style={{width:'150px'}}></div> </div>
            <div style={{textAlign: "center" }}>
                {!isMobile && <><AzeretMonoParagraph weight="regular" style={{ margin: 0, color:colors.darkgreen1000 }}>OFFICIAL OFFER</AzeretMonoParagraph>
                <MintParagraph size="20" weight="medium" style={{marginTop:'6px'}}>
                    {property.streetAddress + ' ' + address2String}
                    <span style={{ color: colors.gray700 }}>{addressData}</span>
                </MintParagraph></>}
            </div>
            {!isMobile && <div style={{ display: "flex" }}>
                <SecondaryButton icon={printIcon} hasArrow size="medium" isLight text={"Print"} />
                <SecondaryButton icon={downloadIcon} hasArrow size="medium" isLight style={{marginLeft:'12px'}} text={"Download"} />
            </div>}
        </OfferHeader>

        <ContentBackground>
            <ContentContainer>
                <div style={{display: 'flex', flexDirection: isMobile ? 'column': 'row', justifyContent: 'space-between', width: '100%'}}>
                    <OfferTypeBadge style={ isMobile ? {fontSize: '12px', padding: '3px 6px'} : {}} type={type}>{type}</OfferTypeBadge>
                    <MintParagraph size='14' weight="medium" style={{ color:colors.gray1000, marginTop: "12", paddingTop: "8px" }}>
                        Expires: {dayjs(offer.expiryDate).format('MMMM D, YYYY h:mma')}
                    </MintParagraph>
                </div>
                <div  style={{ marginTop: "24px" }}>
                <MintParagraph size="32" weight="medium" style={{ margin: 0, paddingBottom: "12px" }}>
                    ${parseFloat(offer?.offerAmt?.toString() || '0').toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </MintParagraph>
                    <DiffAndIcon offerPrice={offerPrice.value() as number} listingPrice={listingPrice.value() as number}/>
                </div>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : 'row', textAlign: "right", width: '100%', marginTop: '32px' }} >
                        <SecondaryButton size="medium" icon={messageIcon} iconHeight={20} iconWidth={20} iconSpacing="12px" onClick={() => {router.push({ pathname: '/messages', query: { groupId: offer.buyerGroupId }});}} isLight hasArrow text={"Message"} style={{ width: "100%" }} reverseArrow/>
                        <div style={{width: '32px', height: '20px'}}></div>
                        <StyledSecondaryButtonAccept size="medium" icon={checkIcon} hasArrow text={"Review & Sign"} reverseArrow style={{ width: "100%" }} onClick={() => acceptOffer(offerId as string)}/>
                        <div style={{width: '32px', height: '20px'}}></div>
                        <StyledSecondaryButtonDecline size="medium" icon={declineIcon} hasArrow text={"Decline"} reverseArrow style={{ width: "100%" }}/>

                </div>
                <MOPSubcontainer style={{ marginBottom: "48px", width: '100%', borderTop: 'none'}}>
                    <MOPHeaderBtnContainer>
                        <MOPHeader title={"Overview & Fees"}/>
                    </MOPHeaderBtnContainer>

                    <OfferReviewLine title={"Housewell Fee"} body={`$${housewellFee.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
                    <OfferReviewLine title={`FMLS Fee (0.12%)`} body={`$${fmlsFee.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
                    <OfferReviewLine title={`Buyer's Commission (${offer.buyerSideCommission}%)`} body={`$${realtorFee.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
                    <OfferReviewLine title={`Closing Cost Contribution`} body={`$${closingCostContribution.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
                    <OfferReviewLine title={`Your Estimated Net`} body={`$${netToSeller.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} noBorder />
                </MOPSubcontainer>
                <MOPSubcontainer style={{ marginBottom: "48px", width: '100%', borderTop: 'none'}}>
                    <MOPHeaderBtnContainer>
                        <MOPHeader title={"Offer & Financing"}/>
                    </MOPHeaderBtnContainer>

                    <OfferReviewLine title={"Offer Amount"} body={`${formatMoney(offer.offerAmt)}`} />
                    <OfferReviewLine title={"Offer Type"} body={offer.offerType === "ESCALATION" ? "Escalation-clause" : "Fixed-price"} />
                    <OfferReviewLine title={"Financing"} body={offer.loanType === "VA" ? "VA Loan" : (offer.loanType === "FHA" ? "FHA Loan" : "Conventional Loan") } />
                    <OfferReviewLine title={"Down Payment"} body={`${formatMoney(offer.downPaymentAmt)} (${downPaymentPercent}%)`} />
                    <OfferReviewLine title={"Seller's Contribution"} body={`${formatMoney(offer.sellerClosingAmt)}`} />
                    <OfferReviewLine title={"Earnest Money"} body={`${formatMoney(offer.earnestMoneyAmt)}`} noBorder />
                </MOPSubcontainer>

                <MOPSubcontainer style={{ marginBottom: "48px", width: '100%'}}>
                    <MOPHeader title={"Property Details"}/>

                    <OfferReviewLine title={"Street Address"} body={`${property.streetAddress}`} />
                    <OfferReviewLine title={"Legal Description"} body={`${property.legalDescription}`} />
                    <OfferReviewLine title={"City"} body={`${property.city}`} />
                    <OfferReviewLine title={"State"} body={`${property.state}`} />
                    <OfferReviewLine title={"Zip Code"} body={`${property.zip}`} />
                    <OfferReviewLine title={"County"} body={`${property.county}`} noBorder />
                </MOPSubcontainer>

                <MOPSubcontainer style={{ marginBottom: "48px", width: '100%'}}>
                    <MOPHeaderBtnContainer>
                        <MOPHeader title={"Contingencies"}/>
                    </MOPHeaderBtnContainer>

                    {contingenciesChildren.length > 0 ? contingenciesChildren : <MintParagraph size={"18"} weight={"medium"}>No contingencies selected.</MintParagraph>}
                </MOPSubcontainer>

                <MOPSubcontainer style={{ marginBottom: "48px", width: '100%'}}>
                    <MOPHeaderBtnContainer>
                        <MOPHeader title={"Dates & Closing"}/>
                    </MOPHeaderBtnContainer>

                    <OfferReviewLine title={"Due Diligence Days"} body={`${offer.dueDiligenceDays} day(s)`} />
                    <OfferReviewLine title={"Expected Closing Date"} body={closingDate.format('MM/DD/YYYY')} subBody={`${closingDate.startOf("day").diff(dayjs().startOf("day"), 'day')} transition day(s)`} />
                    <OfferReviewLine title={"Possession Date & Time"} body={`${possessionDate.format('MM/DD/YYYY — hh:mmA z')}`} subBody={`${possessionDate.startOf("day").diff(dayjs().startOf("day"), 'day')} day(s)`} />
                    <OfferReviewLine title={"Offer Expiration Date & Time"} body={`${expiryDate.format('MM/DD/YYYY — hh:mmA z')}`} subBody={`${expiryDate.startOf("day").diff(dayjs().startOf("day"), 'day')} day(s)`} noBorder />
                </MOPSubcontainer>
            </ContentContainer>
        </ContentBackground>
    </div>
}

export default OfferDetailsPage;