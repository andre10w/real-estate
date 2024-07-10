import { GetServerSidePropsContext } from 'next';
import React, {useEffect, useState} from 'react';
import { makeAuthedApiRequest } from '../../../src/utils/api/apiHelper';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import { AxiosError } from 'axios';
import {useAppDispatch, useAppSelector} from "../../../src/store";
import {fetchUserGroups, GroupWithMembersModel} from "../../../src/slices/groups";
import { LoanApplicationComponent, BorrowerDashboardComponent} from "@pylonlending/react-elements";
import Select from "react-select";
import { MintParagraph, H3 } from '../../../src/components/Typography/Typography';
import { customStyles } from '../../../src/constants';
import {UserModel} from "../../../src/slices/user";
import { colors } from '../../../src/styles/colors';
import StatusMessage from "../../../src/components/stuff/StatusMessage";
import OnboardingScreenFrame from '../../../src/components/stuff/OnboardingScreenFrame';
import AuthNav from '../../../src/components/headerFooter/AuthNav';
import he from 'he';


import MultipleChoiceParent from '../../../src/components/stuff/MultipleChoiceParent';
import SecondaryButton from '../../../src/components/buttons/SecondaryButton';
import { useDevice } from '../../../src/contexts/DeviceContext';
import { set } from 'lodash';

const GroupBox = styled.div`
    width: 659px;
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: flex-start;
`;
type BorrowerPrefill = {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
};

export type LoanApplicationStatuses = 'UNKNOWN' | 'SUBMITTED' | 'PREAPPROVED' | 'CANCELLED';

const Mortgage = (props: {loanApplicationId: string}) => {
    const dispatch = useAppDispatch();
    const { isMobile } = useDevice();
    const router = useRouter();
    const { groupId } = router.query;
    const groups = useAppSelector((state) => state.groupsReducer.groups);
    const user = useAppSelector((state) => state.userReducer.user);
    const [selectedGroup, setSelectedGroup] = useState<GroupWithMembersModel | undefined>();
    useEffect(() => {
        if (groupId && groups) {
            const foundGroup = groups.find((group) => group.group.id === groupId);
            setSelectedGroup(foundGroup || groups[0]);
        }
    }, [groups, groupId]);
    const [selectedUserIndex, setSelectedUserIndex] = useState(-1);
    const [hasSecondUser, setHasSecondUser] = useState<boolean>();
    const [selectedSecondUserIndex, setSelectedSecondUserIndex] = useState(-1);
    const [borrower1, setBorrower1] = useState<BorrowerPrefill>()
    const [borrower2, setBorrower2] = useState<BorrowerPrefill>()
    const [borrowers, setBorrowers] = useState<BorrowerPrefill[]>([])
    const [loanApplicationId, setLoanApplicationId] = useState<string>(props.loanApplicationId || '');
    const [loanApplicationStatus, setLoanApplicationStatus] = useState<LoanApplicationStatuses>('UNKNOWN');

    

    useEffect(() => {
        dispatch(fetchUserGroups({}));
    }, [ dispatch ]);
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
                    return;
                }
                const response = await makeAuthedApiRequest({method: 'post', urlExtension: `/v1/pylon/getGroupLoanApplication`, data});
                const status : LoanApplicationStatuses = !!response.data.status.cancellation_date ? 'CANCELLED' : !!response.data.status.preapproval_date ? 'PREAPPROVED' : !!response.data.status.application_submitted_date ? 'SUBMITTED' :  'UNKNOWN';
                setLoanApplicationId(response.data.loan_application_id);
                setLoanApplicationStatus(status);
            } catch (error) {
                console.log(error);
            }
        }
    
        getLoanApplicationsForGroup();
    }, [ selectedGroup?.group?.id, selectedGroup?.group?.loanApplicationId ]);
    
    const groupMembers = groups
        .filter(group => group.group.id === selectedGroup?.group.id)
        .reduce((acc: UserModel[], group) => {
            group.members
                .filter(newMember => 
                    newMember.firstName && 
                    newMember.lastName && 
                    newMember.email && 
                    newMember.phoneNumber)
                .forEach(newMember => {
                    if (!acc.find(member => member.id === newMember.id)) {
                        acc.push(newMember);
                    }
                });
            return acc;
        }, []);

    const groupMemberChoices = groupMembers.map((member) => { return { text: `${member.firstName} ${member.lastName}` } });


    const groupOptions = groups.map((group: GroupWithMembersModel) => {
        return {
            value: group.group.id,
            label: `${he.decode(group.group.name)} (${group.members.length} ${group.members.length === 1 ? 'member' : 'members'})`
        }
    });

    const fetchPylonAuthLease = async () => {
        const response = await makeAuthedApiRequest({method: 'post', urlExtension: '/v1/pylon/auth',});
        return response.data;
    };


    const setFirstUserIndex = (index: number) => {
        if ( index === selectedSecondUserIndex ) {
            return;
        }
        setBorrower1({
            firstName: groupMembers[index]?.firstName,
            lastName: groupMembers[index]?.lastName,
            email: groupMembers[index]?.email,
            phoneNumber: groupMembers[index]?.phoneNumber,
        })
        setSelectedUserIndex(index);
    }

    const setSecondUserIndex = (index: number) => {
        if ( index === selectedUserIndex ) {
            return;
        }
        setBorrower2({
            firstName: groupMembers[index]?.firstName,
            lastName: groupMembers[index]?.lastName,
            email: groupMembers[index]?.email,
            phoneNumber: groupMembers[index]?.phoneNumber,
        })
        setSelectedSecondUserIndex(index);
    }

    const startLoanApplication = () => {
        if (!borrower1) {
            return
        }
        const tempBorrowers = [borrower1];
        if (borrower2) {
            tempBorrowers.push(borrower2);
        }
        setBorrowers(tempBorrowers);

    }
    const setGroupLoanApplicationId = async ({ loanId }: { loanId: string }) => {
        try {
            const data = {
                groupId: selectedGroup?.group.id,
                loanId,
            }
            await makeAuthedApiRequest({method: 'post', urlExtension: `/v1/pylon/updateLoanApp`, data});
        } catch (error) {
            console.log(error);
        }
    }
    if (loanApplicationStatus === 'CANCELLED') {
        return (<><AuthNav></AuthNav>
                            <GroupBox>
                    <H3>Your loan has been cancelled.</H3>
                    <StatusMessage style={{ margin: "8px 0 36px 0" }} hasIcon>
                        <MintParagraph size={"18"} weight={"medium"}>
                           Please reach out to support for more information.
                        </MintParagraph>
                    </StatusMessage>
                    </GroupBox>
                </>);
    }
    if (loanApplicationId && (loanApplicationStatus === 'SUBMITTED' || loanApplicationStatus === 'PREAPPROVED')) {
        return (<><AuthNav></AuthNav>
        <div style={{}}>
            <BorrowerDashboardComponent
                authLeaseCallback={fetchPylonAuthLease}
                loanId={loanApplicationId}
                theme={{
                    Global: {
                        fonts: {
                          fontFamily: "Mint Grotesk",
                          fontUrls: [
                            "https://housewell.com/fonts/font-file.css",
                          ],
                        },
                      },
                    Components: {
                        Typography: {
                          Title: {
                            fontFamily: "Mint Grotesk",
                          },
                        },
                    },
                    primaryColor: "rgb(29, 49, 28)",
                    secondaryColor: "rgb(224, 101, 13)",
                    backgroundColor: "rgb(255, 255, 255)",
                }}
            /></div></>);
    }

    if (borrowers.length > 0 || (selectedGroup?.group.hasStartedLoanApp && loanApplicationStatus === 'UNKNOWN')) {

        return (<><AuthNav></AuthNav>
        <div style={{marginTop: isMobile ? '40px' : '120px', padding: '0 20px'}}>
            <LoanApplicationComponent
                authLeaseCallback={fetchPylonAuthLease}
                loanApplicationPrefillCallback={() => ({
                    borrowers
                  })}
                  onCompleteCallback={({ loanId }) => {setLoanApplicationId(loanId); setLoanApplicationStatus('SUBMITTED'); setBorrowers([]);}}
                  onStartedCallback={setGroupLoanApplicationId}
                loanId={loanApplicationId || ''}
                theme={{
                    Global: {
                        fonts: {
                          fontFamily: "Mint Grotesk",
                          fontUrls: [
                            "https://housewell.com/fonts/font-file.css",
                          ],
                        },
                      },
                      Components: {
                        Typography: {
                          Title: {
                            fontFamily: "Mint Grotesk",
                          },
                        },
                    },
                    Page: {
                        // HIDE THE DEFAULT IMAGE
                        ".welcome .title-container + .MuiBox-root > .MuiBox-root img": {
                          display: "none",
                        },
                        // ADD A NEW IMAGE AS A BACKGROUND IMAGE
                        ".welcome .title-container + .MuiBox-root > .MuiBox-root": {
                          backgroundImage:
                            "url(https://dyqpd3w9nj7ap.cloudfront.net/static-web-assets/website/housewell_pylon_opening_image.png)",
                          backgroundSize: "cover",
                          // ADD A DIFFERENT WIDTH AND HEIGHT FOR MOBILE
                          "@media (max-width: 768px)": {
                            width: "272px",
                            height: "135px",
                          },
                          // ADD A DIFFERENT WIDTH AND HEIGHT FOR DESKTOP
                          "@media (min-width: 769px)": {
                            width: "588px",
                            height: "288px",
                          },
                        },
                      },
                    primaryColor: "rgb(29, 49, 28)",
                    secondaryColor: "rgb(224, 101, 13)",
                    backgroundColor: "rgb(255, 255, 255)",
                }}
                /></div></>);
    }



    if (user?.userType === 'agent') {
        if (loanApplicationStatus === 'PREAPPROVED') {
            return (
                <>
                    <AuthNav></AuthNav>
                    <GroupBox>
                    <H3>Congrats, this group is pre-approved</H3>
                    <StatusMessage style={{ margin: "8px 0 36px 0" }} hasIcon>
                        <MintParagraph size={"18"} weight={"medium"}>
                            Reach out to your clients for their pre-approval letter.
                        </MintParagraph>
                    </StatusMessage>
                    </GroupBox>
                </>
            )
        }
        return (
            <>
                {
                    (!selectedGroup || !groupId || !selectedGroup.group.loanApplicationId) ? (
                        <>
                        <AuthNav></AuthNav>
                        <GroupBox>
                            <H3>This group isn&apos;t preapproved yet.</H3>
                            <StatusMessage style={{ margin: "8px 0 36px 0" }} hasIcon>
                                <MintParagraph size={"18"} weight={"medium"}>
                                    Let your clients know that they can get pre-approved in minutes through Housewell Mortgage.
                                </MintParagraph>
                            </StatusMessage>
                        </GroupBox>
                        </>
                    ) : (
                        <>
                        <AuthNav></AuthNav>
                        <GroupBox>
                            <H3>This group isn&apos;t preapproved yet.</H3>
                            <StatusMessage style={{ margin: "8px 0 36px 0" }} hasIcon>
                                <MintParagraph size={"18"} weight={"medium"}>
                                    Let your clients know that they can get pre-approved in minutes through Housewell Mortgage. Once they&apos;re pre-approved you can come back and download the pre-approval letter here
                                </MintParagraph>
                            </StatusMessage>
                        </GroupBox>
                        </>
                    )
                }
            </>
        )
    }

    
    if (!selectedGroup || !selectedGroup.group.loanApplicationId) {
        return <OnboardingScreenFrame removeBottomNav>
                {groups.length > 1 ? <div style={{fontFamily: "Mint Grotesk"}}>
                    <MintParagraph size={"20"} weight={"medium"}
                                   style={{margin: "0px 0 24px 0"}}>{`Choose your group and borrowers for mortgage:`}</MintParagraph>
                    <Select
                        styles={customStyles}
                        value={groupOptions.find((group) => selectedGroup?.group && selectedGroup.group.id === group.value)}
                        isLoading={groups.length === 0}
                        isSearchable={true}
                        name="select-group-offer"
                        options={groupOptions}
                        onChange={(selectedOption) => {setSelectedGroup(groups.find((group) => group.group.id === selectedOption?.value))}}
                    />
                </div> :                     <MintParagraph size={"20"} weight={"medium"}
                                   style={{margin: "0px 0 24px 0"}}>{`Choose who will be on this mortgage:`}</MintParagraph>}

                {hasSecondUser && <MintParagraph size={"20"} weight={"medium"} style={{ margin: "36px 0 0 0" }}>{`First Borrower:`}</MintParagraph>}
                <MultipleChoiceParent buttonHeight='64px' useChecks style={{ margin: "24px 0 36px 0" }} choices={groupMemberChoices} selectedIndex={selectedUserIndex} onSelection={(index) => setFirstUserIndex(index)}/>

                { hasSecondUser && <div>
                    <MintParagraph size={"20"} weight={"medium"}>{`Second Borrower:`}</MintParagraph>
                    <MultipleChoiceParent useChecks style={{ margin: "24px 0 36px 0" }} choices={groupMemberChoices} selectedIndex={selectedSecondUserIndex} onSelection={(index) => setSecondUserIndex(index)}/>
                </div>}

                {((selectedGroup?.members?.length || 0) > 1) && <MintParagraph size={"20"} weight={"medium"}
                               style={{margin: "-24px 0 36px 0", color: colors.brandGreen, cursor: "pointer" }}
                               onClick={() => setHasSecondUser(!hasSecondUser)}
                >{!hasSecondUser ? `+ Add a co-borrower to the mortgage` : '- Remove co-borrower from mortgage'}</MintParagraph>}
                <SecondaryButton onClick={startLoanApplication} size='medium' text='Get started' hasArrow></SecondaryButton>
            </OnboardingScreenFrame>;
    }
    

    return (
        <></>);
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
    try {
      const { req, res } = context;
      const { groupId } = context.query;
      const response = await makeAuthedApiRequest({method: 'post', urlExtension: `/v1/group/getGroupById`, data: {groupId}, isServer: true, req, res});
      console.log(response.data);
        return { props: { loanApplicationId: response.data.loanApplicationId } };
    } catch (error) {
      console.log("ERROR", error);
      return { props: { basicAddressData: false } };
    }
}

export default Mortgage;