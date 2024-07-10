import { useRouter } from "next/router";
import styled from "@emotion/styled";
import SecondaryButton from "../../src/components/buttons/SecondaryButton";
import React, { useEffect, useState, useMemo } from "react";
import { useAppSelector, initializeStore } from "../../src/store";
import { PropertyModel } from "../../src/slices/properties";
import { makeAuthedApiRequest } from "../../src/utils/api/apiHelper";
import { AzeretMonoParagraph, MintParagraph } from "../../src/components/Typography/Typography";
import { colors } from "../../src/styles/colors";

import { useDevice } from "../../src/contexts/DeviceContext";
import { fetchOfferById } from "../../src/slices/offers";
import { GetServerSidePropsContext } from 'next';
import LandingPage, {DocumentTypes} from "../../src/components/offerDocuments/LandingPage";
import BasicParentModal from "../../src/components/boxes/modals/BasicParentModal";
import numeral from "numeral";

import Select from "react-select";
import { customStylesTaller } from "../../src/constants";
import { OfferModel } from "../../src/models/offerModel";

import { MOPHeader, MOPSubcontainer, MOPSubheader } from "../../src/components/make-offer/MakeOfferPageComponents";
import { OfferReviewLine } from "../../src/components/make-offer/MakeOfferReviewPage";
import { formatMoney } from "../../src/utils/helpers";
import StyledInputComponent from "../../src/components/boxes/StyledInput";

import { createSignaturesSection } from "../../src/components/make-offer/MakeOfferReviewPage";
import StatusMessage from "../../src/components/stuff/StatusMessage";
import AcknowledgmentCheckbox from "../../src/components/boxes/AcknowledgmentCheckbox";
import { formatPhoneNumber } from "../../src/utils/helpers";

import sellerDisclosure, { fetchSellerDisclosureByPropertyId } from "../../src/slices/sellerDisclosure";
import { sellerDisclosureModel } from "../../src/models/sellerDisclosureModel";

const OfferHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 92px;
    padding: 0 20px;
    border-bottom: 1px solid #CACFCA;
`

const MOPHeaderBtnContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ContentBackground = styled.div`
  display: flex;
  justify-content: center;
  background-color: ${colors.gray100};
`;

const FloatingNav = styled.div<{ isMobile?: boolean }>`
  position: fixed;
  bottom: ${(props) => (props.isMobile ? "20px" : "50px")};
  z-index: 100;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const BottomGradientShadow = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
  pointer-events: none;
  z-index: 50;
`;

const FloatingNavContainer = styled.div<{ isMobile?: boolean }>`
  padding: 10px;
  display: flex;
  flex-direction: ${(props) => (props.isMobile ? "column" : "row")};
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 16px;
  margin: 0 20px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.15);
`;
const FloatingDropdownContainer = styled.div<{ isMobile?: boolean }>`
  padding-right: ${(props) => (props.isMobile ? "0" : "22px")};
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: ${(props) =>
        props.isMobile ? "none" : `1px solid ${colors.gray300}`};
`;
const DocNavButton = styled.button`
  border: 1px solid ${colors.gray600};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  width: 48px;
  height: 48px;
  &:hover {
    background-color: ${colors.gray100};
  }
  &:active {
    background-color: ${colors.gray200};
  }
  &:disabled {
    background-color: white;
        border: 1px solid ${colors.gray100};
    }
    
`

const ContentContainer = styled.div<{isMobile?: boolean}>`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: ${props => props.isMobile ? '0' : '24px'};
    background-color: white;
    box-sizing: border-box;
    width: 100%;
`;

const rightSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
<path d="M6.75 4.5L11.25 9L6.75 13.5" stroke="#1B311C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>)
const rightGraySVG = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M6.75 4.5L11.25 9L6.75 13.5" stroke="#B3B9B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
);

const leftGraySVG = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="19"
        viewBox="0 0 18 19"
        fill="none"
    >
        <path
            d="M11.25 14L6.75 9.5L11.25 5"
            stroke="#B3B9B3"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
);

const leftSVG = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="19"
        viewBox="0 0 18 19"
        fill="none"
    >
        <path
            d="M11.25 14L6.75 9.5L11.25 5"
            stroke="#1B311C"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
);

type DocumentType = {
    value: string;
    label: string;
    numberPages: number;
};
const DOCUMENT_TYPES_VALUES: DocumentTypes[] = [
    "PSA",
    "TEMP_OCC_BUYER",
    "TEMP_OCC_SELLER",
    "ESCALATING",
    "CLOSING_ATTORNEY_HOLDER",
    "LEAD_BASED",
    "SELLER_DISCLOSURE",
];


const OfferReviewPage = (props: { property: PropertyModel}) => {
    const router = useRouter();

    const { isMobile } = useDevice();
    const defaultDocuments = useMemo(() => [
        { value: 'PSA', label: 'Purchase and Sale Agreement', numberPages: 10 }, { value: "SELLER_DISCLOSURE", label: "Seller's Disclosure", numberPages:8}
    ], []);

    const [ selectedDocumentIndex, setSelectedDocumentIndex ] = useState(0);
    const [ shouldShowModal, setShouldShowModal ] = useState(false);
    const [ shouldShowIntroModal, setShouldShowIntroModal ] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedPage, setSelectedPage] = useState(1);
    const [documents, setDocuments] = useState<DocumentType[]>(defaultDocuments);
    const currentDocumentTotalPages = documents[selectedDocumentIndex].numberPages || 0;

    const [purchaseAndSaleAgreementSignature, setPurchaseAndSaleAgreementSignature] = useState('');
    const [shouldShowSignatureSendScreen, setShouldShowSignatureSendScreen] = useState(false);
    
    const [isAcknowledgementChecked, setIsAcknowledgementChecked] = useState(false);

    const offer: OfferModel = useAppSelector((state) => state.offersReducer.selectedOffer) || {} as OfferModel;
    const sellerDisclosureProperty: sellerDisclosureModel = useAppSelector((state) => state.sellerDisclosureReducer.sellerDisclosureProperty);
    const {
        wasConstructedBefore1978
    } = sellerDisclosureProperty[props.property.id];
    const property = props.property || {} as PropertyModel;

    const address2String = property.address2 ? property.address2 + ' ' : '';
    const addressData = property.city + ', ' + property.state + ' ' + property.zip;

    const [currentSignatureScreen, setCurrentSignatureScreen] = useState(0);


    const [isNextEnabled, setIsNextEnabled] = useState(false);

    const closeIntroModal = () => {
        setShouldShowIntroModal(false)
    }
    const closeModal = () => {
        setShouldShowModal(false)
    }


    const currentDate = new Date();

    function updateEnabled(
        firstName: string,
        lastName: string,
        address: string,
        phoneNumber: string,
        signature: string,
        acknowledgement: boolean
    ) {
        setIsNextEnabled(!!lastName && !!firstName && !!phoneNumber && !!signature && !!address && acknowledgement);
    }

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedNumber);
        updateEnabled(firstName, lastName, address, formattedNumber, purchaseAndSaleAgreementSignature, isAcknowledgementChecked);
    };

    const day = currentDate.getDate();  // Gets the day of the month
    const month = currentDate.getMonth() + 1;  // Gets the month (Note: Months are 0-indexed)
    const year = currentDate.getFullYear();  // Gets the year

    const currentDateString = `${year}-${month}-${day}`

    const downPaymentPercent = (offer.downPaymentAmt && offer.offerAmt) 
    ? Math.round((offer.downPaymentAmt / offer.offerAmt) * 10000) / 100
    : 0;
    const offerPrice = numeral(offer.offerAmt);
    const realtorFee = offerPrice.value() as number * (offer.buyerSideCommission! / 100);
    const signaturesChildren = createSignaturesSection(offer);


    useEffect(() => {
        // Assuming that this useEffect will be called when offer updates
        if (offer) {
            let updatedDocuments = [...defaultDocuments];
            if (offer.closingAttorneyAsHolderOfEarnestMoney) {
                const newDoc: DocumentType = { value: DOCUMENT_TYPES_VALUES[4], label: 'Attorney Holder Earnest Money', numberPages: 2 };
                updatedDocuments.push(newDoc);
            }
            if (offer.offerType === 'ESCALATION') {
                const newDoc: DocumentType = { value: DOCUMENT_TYPES_VALUES[3], label: 'Escalation Addendum', numberPages: 1 };
                updatedDocuments.push(newDoc);
            }

            if (offer.tempOccCont) {
                const newDoc: DocumentType = { value: DOCUMENT_TYPES_VALUES[2], label: 'Temporary Occupancy Sellers', numberPages: 2 };
                updatedDocuments.push(newDoc);
            }
            if (offer.tempOccBuyerCont) {
                const newDoc: DocumentType = { value: DOCUMENT_TYPES_VALUES[1], label: 'Temporary Occupancy Buyers', numberPages: 2 };
                updatedDocuments.push(newDoc);
            }
            if (wasConstructedBefore1978) {
                const newDoc: DocumentType = { value: DOCUMENT_TYPES_VALUES[5], label: 'Lead Based Paint Disclosure', numberPages: 2 };
                updatedDocuments.push(newDoc);
            }
            // Set the updated documents array
            setDocuments(updatedDocuments);
        }
    }, [offer, defaultDocuments, wasConstructedBefore1978]);

    const nextSignatureScreen = async () => {
        if (currentSignatureScreen === documents.length - 1) {
            setShouldShowSignatureSendScreen(true);
            const now = new Date();
            const data = {
                purchaseAndSaleAgreementSignature,
                documents,
                offerId: offer.id,
                updatedAt: offer.updatedAt,
                firstName,
                lastName,
                address,
                phone,
                isAcknowledgementChecked,
                signatureTimestamp: now.toISOString(),
            }
        }
        if (currentSignatureScreen < documents.length - 1) {
            setCurrentSignatureScreen(prevScreen => prevScreen + 1);
        }
    }
    

    const prevSignatureScreen = () => {
        if (currentSignatureScreen > 0) {
            setCurrentSignatureScreen(prevScreen => prevScreen - 1);
        }
    }



    const getSignatureContent = (documentType: DocumentType) => {
        if (shouldShowSignatureSendScreen) {
            return (
                <div></div>
            )
        }
        const possessionDate = new Date(offer.possessionDate as Date);
        const formattedPossessionDate = `${possessionDate.toLocaleString('en-US', { month: 'long' })} ${possessionDate.getDate()} ${possessionDate.getFullYear()}`;
        const closingDate = new Date(offer.closingDate as Date);
        const formattedClosingDate = `${closingDate.toLocaleString('en-US', { month: 'long' })} ${closingDate.getDate()}, ${closingDate.getFullYear()}`;
        switch (documentType.value) {
            case 'PSA':
                // Return JSX content specific to PSA
                return  (
                    <ContentContainer>
                <MintParagraph size="32" weight="medium">Sign Purchase and Sale Agreement</MintParagraph>
                <MOPSubcontainer style={{ marginBottom: "48px", width: '100%', borderTop: 'none'}}>
                    <MOPHeaderBtnContainer>
                        <MOPHeader title={"Financial Overview"}/>
                    </MOPHeaderBtnContainer>

                    <OfferReviewLine title={"Offer Amount"} body={`${formatMoney(offer.offerAmt)}`} />
                    <OfferReviewLine title={"Offer Type"} body={offer.offerType === "ESCALATION" ? "Escalation-clause" : "Fixed-price"} />
                    <OfferReviewLine title={"Financing"} body={offer.loanType === "VA" ? "VA Loan" : (offer.loanType === "FHA" ? "FHA Loan" : "Conventional Loan") } />
                    <OfferReviewLine title={"Down Payment"} body={`${formatMoney(offer.downPaymentAmt)} (${downPaymentPercent}%)`} />
                    <OfferReviewLine title={"Seller's Contribution"} body={`${formatMoney(offer.sellerClosingAmt)}`} />
                    {!offer.buyerAgentUserId && <OfferReviewLine title={`Housewell Rebate (${offer.buyerSideCommission}%)`} body={`$${realtorFee.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />}
                    <OfferReviewLine title={"Earnest Money"} body={`${formatMoney(offer.earnestMoneyAmt)}`} noBorder />
                </MOPSubcontainer>
                <MOPSubcontainer style={{ marginBottom: "48px", width: '100%', borderTop: 'none'}}>
                    <MOPHeaderBtnContainer>
                        <MOPHeader title={"Signatures"}/>
                    </MOPHeaderBtnContainer>

                        {signaturesChildren.length > 0 ? signaturesChildren : <MintParagraph size={"18"} weight={"medium"}>No contingencies selected.</MintParagraph>}
                </MOPSubcontainer>
                <MOPSubheader title={"Phone"} margin="12px 0"/>
                <StyledInputComponent
                        style={{width:"100%"}}
                        placeholder="Phone"
                        autoComplete="address-line1"
                        onChange={handlePhoneNumberChange}
                        value={phone}
                    />
                <MOPSubheader title={"Current Address"} margin="12px 0"/>
                <StyledInputComponent
                        style={{width:"100%"}}
                        placeholder="Address"
                        autoComplete="address-line1"
                        onChange={(e) => {
                            setAddress(e.target.value); 
                            updateEnabled(firstName, lastName, e.target.value, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                        }}
                        value={address}
                    />
                
                <MOPSubheader title={"First Name"} margin="12px 0"/>
                <StyledInputComponent
                        style={{width:"100%"}}
                        placeholder="First Name"
                        autoComplete="given-name"
                        onChange={(e) => {
                            setFirstName(e.target.value);
                            updateEnabled(e.target.value, lastName, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                        }}
                        value={firstName}
                    />
                <MOPSubheader title={"Last Name"} margin="12px 0"/>
                <StyledInputComponent
                        style={{width:"100%"}}
                        placeholder="Last Name"
                        autoComplete="family-name"
                        onChange={(e) => {
                            setLastName(e.target.value); 
                            updateEnabled(firstName, e.target.value, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                        }}
                        value={lastName}
                />
                <MOPSubheader title={"Signature"} margin="12px 0"/>
                <StatusMessage style={{ margin: "0" }} hasIcon>
                    <MintParagraph size={"14"} weight={"medium"}>This is how your signature will appear on the Purchase and Sale Agreement.</MintParagraph>
                </StatusMessage>
                <StyledInputComponent
                        style={{width:"100%", marginBottom: '12px'}}
                        placeholder="Signature"
                        onChange={(e) => {
                            setPurchaseAndSaleAgreementSignature(e.target.value); 
                            updateEnabled(firstName, lastName, address, phone, e.target.value,isAcknowledgementChecked); 
                        }}
                        isCursive
                        value={purchaseAndSaleAgreementSignature}
                />
                <AcknowledgmentCheckbox
                    isChecked={isAcknowledgementChecked}
                    onToggle={() => {
                        const newCheckedState = !isAcknowledgementChecked;
                        setIsAcknowledgementChecked(newCheckedState);
                        updateEnabled(firstName, lastName, address, phone, purchaseAndSaleAgreementSignature, newCheckedState);
                    }}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop:'20px', width: '100%'}}>
                    <div></div>
                    <SecondaryButton disabled={!isNextEnabled} text="Sign" size="medium" hasArrow onClick={nextSignatureScreen}></SecondaryButton>
                </div>

            </ContentContainer>
                );


            case 'TEMP_OCC_BUYER':
                // Return JSX content specific to TEMP_OCC_BUYER
                return (<ContentContainer>
                    <MOPSubcontainer style={{ marginBottom: "48px", width: '100%', borderTop: 'none'}}>
                        <MOPHeaderBtnContainer>
                            <MOPHeader title={"Sign Temporary Occupancy Buyer"}/>
                        </MOPHeaderBtnContainer>
    
                        <OfferReviewLine title={"Possession Date"} body={formattedPossessionDate} />
                        <OfferReviewLine title={"Closing Date"} body={formattedClosingDate} />
                        <OfferReviewLine title={"Daily Rental Cost"} body={`${formatMoney(offer.tempOccBuyerDailyCost)}`} />
                    </MOPSubcontainer>
                    <MOPSubheader title={"Phone"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Phone"
                            autoComplete="address-line1"
                            onChange={handlePhoneNumberChange}
                            value={phone}
                            disabled
                        />
                    <MOPSubheader title={"Current Address"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Address"
                            autoComplete="address-line1"
                            onChange={(e) => {
                                setAddress(e.target.value); 
                                updateEnabled(firstName, lastName, e.target.value, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={address}
                            disabled
                        />
                    
                    <MOPSubheader title={"First Name"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="First Name"
                            autoComplete="given-name"
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                updateEnabled(e.target.value, lastName, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={firstName}
                            disabled
                        />
                    <MOPSubheader title={"Last Name"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Last Name"
                            autoComplete="family-name"
                            onChange={(e) => {
                                setLastName(e.target.value); 
                                updateEnabled(firstName, e.target.value, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={lastName}
                    />
                    <MOPSubheader title={"Signature"} margin="12px 0"/>
                    <StatusMessage style={{ margin: "0" }} hasIcon>
                        <MintParagraph size={"14"} weight={"medium"}>This is how your signature will appear on the Purchase and Sale Agreement.</MintParagraph>
                    </StatusMessage>
                    <StyledInputComponent
                            style={{width:"100%", marginBottom: '12px'}}
                            placeholder="Signature"
                            onChange={(e) => {
                                setPurchaseAndSaleAgreementSignature(e.target.value); 
                                updateEnabled(firstName, lastName, address, phone, e.target.value,isAcknowledgementChecked); 
                            }}
                            isCursive
                            value={purchaseAndSaleAgreementSignature}
                    />
                    <AcknowledgmentCheckbox
                        isChecked={isAcknowledgementChecked}
                        onToggle={() => {
                            const newCheckedState = !isAcknowledgementChecked;
                            setIsAcknowledgementChecked(newCheckedState);
                            updateEnabled(firstName, lastName, address, phone, purchaseAndSaleAgreementSignature, newCheckedState);
                        }}
                    />
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop:'20px', width: '100%'}}>
                        <SecondaryButton text="Back" isLight size="medium" onClick={prevSignatureScreen}></SecondaryButton>
                        <SecondaryButton disabled={!isNextEnabled} text="Sign" size="medium" onClick={nextSignatureScreen} hasArrow></SecondaryButton>
                    </div>
    
                </ContentContainer>);
            case 'TEMP_OCC_SELLER':
                // Return JSX content specific to TEMP_OCC_SELLER
                return (<ContentContainer>
                    <MOPSubcontainer style={{ marginBottom: "48px", width: '100%', borderTop: 'none'}}>
                        <MOPHeaderBtnContainer>
                            <MOPHeader title={"Sign Temporary Occupancy Seller"}/>
                        </MOPHeaderBtnContainer>
                        <OfferReviewLine title={'Closing Date'} body={formattedClosingDate} />
                        <OfferReviewLine title={"Possession Date"} body={formattedPossessionDate} />
                        <OfferReviewLine title={"Down Payment"} body={`${formatMoney(offer.tempOccPenaltyAmt)}`} />
                    </MOPSubcontainer>
                    <MOPSubheader title={"Phone"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Phone"
                            autoComplete="address-line1"
                            onChange={handlePhoneNumberChange}
                            value={phone}
                            disabled
                        />
                    <MOPSubheader title={"Current Address"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Address"
                            autoComplete="address-line1"
                            onChange={(e) => {
                                setAddress(e.target.value); 
                                updateEnabled(firstName, lastName, e.target.value, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={address}
                            disabled
                        />
                    
                    <MOPSubheader title={"First Name"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="First Name"
                            autoComplete="given-name"
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                updateEnabled(e.target.value, lastName, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={firstName}
                            disabled
                        />
                    <MOPSubheader title={"Last Name"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Last Name"
                            autoComplete="family-name"
                            onChange={(e) => {
                                setLastName(e.target.value); 
                                updateEnabled(firstName, e.target.value, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={lastName}
                    />
                    <MOPSubheader title={"Signature"} margin="12px 0"/>
                    <StatusMessage style={{ margin: "0" }} hasIcon>
                        <MintParagraph size={"14"} weight={"medium"}>This is how your signature will appear on the Purchase and Sale Agreement.</MintParagraph>
                    </StatusMessage>
                    <StyledInputComponent
                            style={{width:"100%", marginBottom: '12px'}}
                            placeholder="Signature"
                            onChange={(e) => {
                                setPurchaseAndSaleAgreementSignature(e.target.value); 
                                updateEnabled(firstName, lastName, address, phone, e.target.value,isAcknowledgementChecked); 
                            }}
                            isCursive
                            value={purchaseAndSaleAgreementSignature}
                    />
                    <AcknowledgmentCheckbox
                        isChecked={isAcknowledgementChecked}
                        onToggle={() => {
                            const newCheckedState = !isAcknowledgementChecked;
                            setIsAcknowledgementChecked(newCheckedState);
                            updateEnabled(firstName, lastName, address, phone, purchaseAndSaleAgreementSignature, newCheckedState);
                        }}
                    />
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop:'20px', width: '100%'}}>
                        <SecondaryButton text="Back" isLight size="medium" onClick={prevSignatureScreen}></SecondaryButton>
                        <SecondaryButton disabled={!isNextEnabled} text="Sign" size="medium" onClick={nextSignatureScreen} hasArrow></SecondaryButton>
                    </div>
    
                </ContentContainer>);
            case 'ESCALATING':
                return (<ContentContainer>
                    <MOPSubcontainer style={{ marginBottom: "48px", width: '100%', borderTop: 'none'}}>
                        <MOPHeaderBtnContainer>
                            <MOPHeader title={"Sign Escalation Clause"}/>
                        </MOPHeaderBtnContainer>
    
                        <OfferReviewLine title={"Offer Price"} body={`${formatMoney(offer.offerAmt)}`} />
                        <OfferReviewLine title={"Escalation Amount"} body={`${formatMoney(offer.escalationAmt)}`} />
                        <OfferReviewLine title={"Escalation Max Amount"} body={`${formatMoney(offer.escalationMaxAmt)}`} />
                    </MOPSubcontainer>
                    <MOPSubheader title={"Phone"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Phone"
                            autoComplete="address-line1"
                            onChange={handlePhoneNumberChange}
                            value={phone}
                            disabled
                        />
                    <MOPSubheader title={"Current Address"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Address"
                            autoComplete="address-line1"
                            onChange={(e) => {
                                setAddress(e.target.value); 
                                updateEnabled(firstName, lastName, e.target.value, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={address}
                            disabled
                        />
                    
                    <MOPSubheader title={"First Name"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="First Name"
                            autoComplete="given-name"
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                updateEnabled(e.target.value, lastName, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={firstName}
                            disabled
                        />
                    <MOPSubheader title={"Last Name"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Last Name"
                            autoComplete="family-name"
                            onChange={(e) => {
                                setLastName(e.target.value); 
                                updateEnabled(firstName, e.target.value, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={lastName}
                            disabled
                    />
                    <MOPSubheader title={"Signature"} margin="12px 0"/>
                    <StatusMessage style={{ margin: "0" }} hasIcon>
                        <MintParagraph size={"14"} weight={"medium"}>This is how your signature will appear on the Purchase and Sale Agreement.</MintParagraph>
                    </StatusMessage>
                    <StyledInputComponent
                            style={{width:"100%", marginBottom: '12px'}}
                            placeholder="Signature"
                            onChange={(e) => {
                                setPurchaseAndSaleAgreementSignature(e.target.value); 
                                updateEnabled(firstName, lastName, address, phone, e.target.value,isAcknowledgementChecked); 
                            }}
                            isCursive
                            value={purchaseAndSaleAgreementSignature}
                    />
                    <AcknowledgmentCheckbox
                        isChecked={isAcknowledgementChecked}
                        onToggle={() => {
                            const newCheckedState = !isAcknowledgementChecked;
                            setIsAcknowledgementChecked(newCheckedState);
                            updateEnabled(firstName, lastName, address, phone, purchaseAndSaleAgreementSignature, newCheckedState);
                        }}
                    />
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop:'20px', width: '100%'}}>
                        <SecondaryButton text="Back" isLight size="medium" onClick={prevSignatureScreen}></SecondaryButton>
                        <SecondaryButton disabled={!isNextEnabled} text="Sign" size="medium" hasArrow onClick={nextSignatureScreen}></SecondaryButton>
                    </div>
    
                </ContentContainer>);
            case 'CLOSING_ATTORNEY_HOLDER':
                return (<ContentContainer>
                    <MOPSubcontainer style={{ marginBottom: "48px", width: '100%', borderTop: 'none'}}>
                        <MOPHeaderBtnContainer>
                            <MOPHeader title={"Sign Attorney as Holder of Earnest Money"}/>
                        </MOPHeaderBtnContainer>
    
                        <OfferReviewLine title={"Closing Attorney"} body={offer.closingAttorney as string} />
                        <OfferReviewLine title={"Closing Attorney Address"} body={offer.closingAttorneyAddress as string} />
                        <OfferReviewLine title={"Closing Attorney Phone"} body={offer.closingAttorneyPhone as string} />
                        <OfferReviewLine title={"Closing Attorney Email"} body={offer.closingAttorneyEmail as string} />
                    </MOPSubcontainer>
                    <MOPSubheader title={"Phone"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Phone"
                            autoComplete="address-line1"
                            onChange={handlePhoneNumberChange}
                            value={phone}
                            disabled
                        />
                    <MOPSubheader title={"Current Address"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Address"
                            autoComplete="address-line1"
                            onChange={(e) => {
                                setAddress(e.target.value); 
                                updateEnabled(firstName, lastName, e.target.value, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={address}
                            disabled
                        />
                    
                    <MOPSubheader title={"First Name"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="First Name"
                            autoComplete="given-name"
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                updateEnabled(e.target.value, lastName, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={firstName}
                            disabled
                        />
                    <MOPSubheader title={"Last Name"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Last Name"
                            autoComplete="family-name"
                            onChange={(e) => {
                                setLastName(e.target.value); 
                                updateEnabled(firstName, e.target.value, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={lastName}
                            disabled
                    />
                    <MOPSubheader title={"Signature"} margin="12px 0"/>
                    <StatusMessage style={{ margin: "0" }} hasIcon>
                        <MintParagraph size={"14"} weight={"medium"}>This is how your signature will appear on the Purchase and Sale Agreement.</MintParagraph>
                    </StatusMessage>
                    <StyledInputComponent
                            style={{width:"100%", marginBottom: '12px'}}
                            placeholder="Signature"
                            onChange={(e) => {
                                setPurchaseAndSaleAgreementSignature(e.target.value); 
                                updateEnabled(firstName, lastName, address, phone, e.target.value,isAcknowledgementChecked); 
                            }}
                            isCursive
                            value={purchaseAndSaleAgreementSignature}
                    />
                    <AcknowledgmentCheckbox
                        isChecked={isAcknowledgementChecked}
                        onToggle={() => {
                            const newCheckedState = !isAcknowledgementChecked;
                            setIsAcknowledgementChecked(newCheckedState);
                            updateEnabled(firstName, lastName, address, phone, purchaseAndSaleAgreementSignature, newCheckedState);
                        }}
                    />
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop:'20px', width: '100%'}}>
                        <SecondaryButton text="Back" isLight size="medium" onClick={prevSignatureScreen}></SecondaryButton>
                        <SecondaryButton disabled={!isNextEnabled} text="Sign" size="medium" hasArrow onClick={nextSignatureScreen}></SecondaryButton>
                    </div>
    
                </ContentContainer>);
            case 'LEAD_BASED':
                return (<ContentContainer>
                    <MOPSubcontainer style={{ marginBottom: "48px", width: '100%', borderTop: 'none'}}>
                        <MOPHeaderBtnContainer>
                            <MOPHeader title={"Sign Lead Based Paint Disclosure"}/>
                        </MOPHeaderBtnContainer>
    
                        <OfferReviewLine title={"Seller's Disclosure"} body={'asdfasd'} />
                    </MOPSubcontainer>
                    <MOPSubheader title={"Phone"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Phone"
                            autoComplete="address-line1"
                            onChange={handlePhoneNumberChange}
                            value={phone}
                            disabled
                        />
                    <MOPSubheader title={"Current Address"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Address"
                            autoComplete="address-line1"
                            onChange={(e) => {
                                setAddress(e.target.value); 
                                updateEnabled(firstName, lastName, e.target.value, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={address}
                            disabled
                        />
                    
                    <MOPSubheader title={"First Name"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="First Name"
                            autoComplete="given-name"
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                updateEnabled(e.target.value, lastName, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={firstName}
                            disabled
                        />
                    <MOPSubheader title={"Last Name"} margin="12px 0"/>
                    <StyledInputComponent
                            style={{width:"100%"}}
                            placeholder="Last Name"
                            autoComplete="family-name"
                            onChange={(e) => {
                                setLastName(e.target.value); 
                                updateEnabled(firstName, e.target.value, address, phone, purchaseAndSaleAgreementSignature, isAcknowledgementChecked); 
                            }}
                            value={lastName}
                    />
                    <MOPSubheader title={"Signature"} margin="12px 0"/>
                    <StatusMessage style={{ margin: "0" }} hasIcon>
                        <MintParagraph size={"14"} weight={"medium"}>This is how your signature will appear on the Purchase and Sale Agreement.</MintParagraph>
                    </StatusMessage>
                    </ContentContainer>
                )
            default:
                return null;
        }
    };


    return <div style={{position: 'relative'}}>
        <OfferHeader style={{height: isMobile ? '40px': '60px'}}>
            <div style={{display:'flex'}}><SecondaryButton size={isMobile ? 'small' : 'medium'} hasArrow isLight borderless reverseArrow text={"Back"} style={{ height: isMobile ? '35px' : '40px'}} onClick={() => router.push(`/make-offer?offerId=${offer.id}`)} /> </div>
            <div style={{textAlign: "center" }}>
                {!isMobile && <><AzeretMonoParagraph weight="regular" style={{ margin: 0, color:colors.darkgreen1000 }}>OFFER PREVIEW</AzeretMonoParagraph>
                <MintParagraph size="20" weight="medium" style={{marginTop:'6px'}}>
                    {property.streetAddress + ' ' + address2String}
                    <span style={{ color: colors.gray700 }}>{addressData}</span>
                </MintParagraph></>}
            </div>
            {!isMobile && <div style={{ display: "flex" }}>
                <div style={{width: '170px'}}></div>
            </div>}
        </OfferHeader>

        <ContentBackground>
            <LandingPage selectedPage={selectedPage} docType={documents[selectedDocumentIndex].value} offer={offer} property={property} currentDateString={currentDateString}></LandingPage>
        </ContentBackground>
        {shouldShowModal ? 
        
        <BasicParentModal closeModal={closeModal}>
             {getSignatureContent(documents[currentSignatureScreen])}
        </BasicParentModal> 
        
        : <>{!shouldShowIntroModal && <FloatingNav isMobile={isMobile}>
            <FloatingNavContainer isMobile={isMobile}>
                <FloatingDropdownContainer isMobile={isMobile}>
                    <Select
                        styles={customStylesTaller}
                        value={documents.find((doc) => doc.value === documents[selectedDocumentIndex].value)}
                        isLoading={documents.length === 0}
                        isSearchable={false}
                        name="select-document"
                        options={documents}
                        menuPlacement="top"
                        onChange={(selectedOption) => {setSelectedDocumentIndex(documents.findIndex((doc) => doc.value === selectedOption?.value)); setSelectedPage(1);}}
                    />
                    <DocNavButton 
                        style={{marginLeft: '8px'}}
                        disabled={isMobile ? (selectedPage === 1) : (selectedDocumentIndex === 0)} 
                        onClick={() => {
                            if (isMobile) {
                                setSelectedPage(selectedPage - 1);
                            } else {
                                setSelectedDocumentIndex(selectedDocumentIndex - 1);
                            }
                        }}
                    >
                        {isMobile ? (selectedPage === 1 ? leftGraySVG : leftSVG) : (selectedDocumentIndex === 0 ? leftGraySVG : leftSVG)}
                    </DocNavButton>

                    <DocNavButton 
                        disabled={isMobile ? (selectedPage === currentDocumentTotalPages) : (selectedDocumentIndex === (documents.length - 1))} 
                        onClick={() => {
                            if (isMobile) {
                                setSelectedPage(selectedPage + 1);
                            } else {
                                setSelectedDocumentIndex(selectedDocumentIndex + 1);
                            }
                        }}
                        style={{marginLeft: '4px'}}
                    >
                        {isMobile ? (selectedPage === currentDocumentTotalPages ? rightGraySVG : rightSVG) : (selectedDocumentIndex === (documents.length - 1) ? rightGraySVG : rightSVG)}
                    </DocNavButton>
                
                </FloatingDropdownContainer>
                <SecondaryButton
                    size="medium"
                    onClick={() => setShouldShowModal(true)}
                    text="Continue to Sign"
                    hasArrow
                    style={{marginLeft: isMobile ? '0' : '22px', width: isMobile ? '100%' : 'auto', marginTop: isMobile ? '10px' : '0'}}
                />
            </FloatingNavContainer>
        </FloatingNav>}</>}
        {shouldShowIntroModal && <BasicParentModal closeModal={closeIntroModal} nonClosable>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'left', justifyContent: 'flex-start', padding: '17px', }}>
            
            <MintParagraph size="32" weight="medium">Review these documents carefully</MintParagraph>
            <MintParagraph size='16' weight="regular" style={{ marginTop: "16px", marginBottom: "32px" }}>This is a legally binding offer for your review. Please review these documents carefully as they are the source of truth for the offer.</MintParagraph>
            <StatusMessage style={{ margin: "12px 0 36px 0" }} hasIcon>
                <MintParagraph size={"14"} weight={"medium"}>Though we have taken great care to ensure that these documents fulfill the needs of most home buyers and sellers, every home purchase is different and our documents may not perfectly fit your needs. Please review these documents carefully. You can reach out to Housewell through messages if you have general questions about the documents or consult with your attorney or agent to receive specialized advice.</MintParagraph>
            </StatusMessage>

            <SecondaryButton size="medium" onClick={() => setShouldShowIntroModal(false)} text="Acknowledge" hasArrow style={{ width: "100%" }} />
            </div>

            </BasicParentModal>
        }
        <BottomGradientShadow />
    </div>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    try {
      const store = initializeStore();
      const { req, res } = context;
      const { offerId, propertyId } = context.query;
      const offerIdString = offerId as string;
      await store.dispatch(fetchOfferById({offerId: offerIdString, isServer: true, req: context.req, res: context.res }));
      await store.dispatch(fetchSellerDisclosureByPropertyId({propertyId: propertyId as string, isServer: true, req: context.req, res: context.res }))
      const data = { propertyId };
      const response = await makeAuthedApiRequest({method: 'post', data, urlExtension: '/v1/property/propertyInfo', isServer: true, req, res});
      const { offersReducer, sellerDisclosureReducer } = store.getState();
      console.log("sellerdisclosure reducers", sellerDisclosureReducer);
      return { props: { initialState: { offersReducer, sellerDisclosureReducer }, property: response.data.property } };
    } catch (error) {
        console.log("ERROR", error);
        return { props: { basicAddressData: false } };
    }
}
    

export default OfferReviewPage;
