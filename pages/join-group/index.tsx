import { GetServerSidePropsContext } from 'next';
import React, {useEffect} from 'react';
import { makeAuthedApiRequest } from '../../src/utils/api/apiHelper';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import axios, { AxiosError } from 'axios';
import { colors } from '../../src/styles/colors';
import OnboardingScreenFrame from '../../src/components/stuff/OnboardingScreenFrame';
import { MintParagraph, H2} from '../../src/components/Typography/Typography';
import SecondaryButton from '../../src/components/buttons/SecondaryButton';
import AuthNav from '../../src/components/headerFooter/AuthNav';

type StatusTypes = 'success' | 'error' | 'unauthed';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;
const ContentParent = styled.div`
    overflow: auto;
    width: 100%;
    margin-top: 132px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    
`

const JoinGroup = (props: { status: StatusTypes; groupOwnerFirstName?: string, onboardingStep?:string }) => {
    const router = useRouter();
    const { status } = props;
    useEffect(() => {
        if (status === 'unauthed') {
            const in24Hours = new Date();
            in24Hours.setHours(in24Hours.getHours() + 24);
            setCookie('redirectUrl', router.asPath, { expires: in24Hours });
        }
    }, [status, router.asPath]);
    if(status === 'success') {
        return (
            <>
            <AuthNav></AuthNav>
            <ContentParent>
                <Container>
                    <H2>Congratulations!</H2>
                    {props.groupOwnerFirstName ? (
                        <MintParagraph size='18' weight='regular' style={{color:colors.gray700, marginTop:'16px'}}>
                        You successfully joined{' '}
                        <span style={{color: 'desiredColorHere'}}>{props.groupOwnerFirstName}&apos;s </span> 
                        group
                        </MintParagraph>
                    ): 
                    <MintParagraph size='18' weight='regular' style={{color:colors.gray700, marginTop:'16px'}}>You joined the group</MintParagraph>}
                </Container>
            </ContentParent>
            </>
        )
    } else if (status === 'unauthed') {
        return (
            <ContentParent>
                <Container>
                    <H2>Login Required</H2>
                    <MintParagraph size='18' weight='regular' style={{color:colors.gray700, marginTop:'16px'}}>Please log in or create an account to join this group</MintParagraph>
                    <MintParagraph size='18' weight='regular' style={{color:colors.gray700, marginTop:'16px'}}>We&apos;ll add you to the group when you&apos;re done</MintParagraph>
                    <SecondaryButton size='large' style={{width:'75%', marginTop:'32px'}} text='Sign Up or Login' onClick={() => router.push('/signup')}></SecondaryButton>
                </Container>
            </ContentParent>
        )
    } else if (status === 'error') {
        return (
            <ContentParent>
                <Container>
                    <H2>Problem joining group.</H2>
                    <MintParagraph size='18' weight='regular' style={{color:colors.gray700, marginTop:'16px'}}>There was a problem joining the group.</MintParagraph>
                    <MintParagraph size='18' weight='regular' style={{color:colors.gray700, marginTop:'16px'}}>You may have already joined this group or the link may have expired.</MintParagraph>
                    <SecondaryButton size='large' style={{width:'75%', marginTop:'32px'}} text='Go Home' onClick={() => router.push('/')}></SecondaryButton>
                </Container>
            </ContentParent>
        )
    }

    return null;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const { req, res, query } = context;
    const token = query.token;
    if (!token) {
        return { props: { status: 'error' } };
    }

    try {
        const response = await makeAuthedApiRequest({method: 'post', data: {token}, urlExtension: '/v1/user/joinGroup', isServer: true, req, res});


        const { userFirstName, onboardingStep } = response.data;
        return { props: { status: 'success', groupOwnerFirstName: userFirstName, onboardingStep } };
    } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError && axiosError.response && axiosError.response.status === 401) {
            return { props: { status: 'unauthed'} };
        } else {
            console.error("ERROR", error);
            return { props: { status: 'error' } };
        }
    }
}

export default JoinGroup;