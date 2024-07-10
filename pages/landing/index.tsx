import React, { useEffect, useLayoutEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { GroupWithMembersModel } from "../../src/slices/groups";
import { fetchOffersByBuyerGroupId } from '../../src/slices/offers';
import { useDevice } from '../../src/contexts/DeviceContext';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Image from 'next/image';
import gsap from 'gsap'
import MotionPathPlugin from 'gsap/dist/MotionPathPlugin';
import Link from 'next/link';
import PrimaryButton from '../../src/components/buttons/PrimaryButton';
import CardsAnimation from '../../src/components/landing/Cards';
import CloudsAnimation from '../../src/components/landing/Clouds';
import { Azeret_Mono } from '@next/font/google';
import BlogAnimation from '../../src/components/landing/Blog';
import _ from 'lodash'
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import ScrollSmoother from "gsap-trial/ScrollSmoother";
const azeretMono = Azeret_Mono({
    weight: ['600'],
    style: ['normal'],
    preload: false,
});
gsap.registerPlugin(MotionPathPlugin, ScrollSmoother);
gsap.registerPlugin(ScrollTrigger);

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const Navbar = styled.div`
    display: flex;
    width: 100%;
    height: 100px;
    align-items: center;
    border-bottom: 1px solid #e9e9e9;
    justify-content: space-between;
`;

const NavbarText = styled.div`
    color: #0E150E;
    font-family: Mint Grotesk;
    font-size: 20px;
    font-style: normal;
    font-weight: 500;
    line-height: 22px;
    letter-spacing: -0.2px;
    display: flex;
    align-items: center;
    margin: 0rem 1rem;
`;

const NavLink = styled.div`
    display: flex;
    align-items: center;
`;

const HomeContainer = styled.div`
    height: 45rem;
    display: flex;
    align-items: center;
    padding-left: 5rem;
`;

const HomeContainerText1 = styled.div`
    color: #0E150E;
    font-family: Austin News Deck;
    font-size: 100px;
    font-style: normal;
    font-weight: 300;
    line-height: 124px;
    letter-spacing: -6.2px;
`;

const HomeContainerText2 = styled.div`
    color: #0E150E;
    font-family: Mint Grotesk;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: 26px;
    letter-spacing: -0.5px;
    margin-top: 6rem;
`;

const HomeContainerText3 = styled.div`
    color: #0E150E;
    font-family: Mint Grotesk;
    font-size: 20px;
    font-style: normal;
    font-weight: 300;
    line-height: 26px;
    letter-spacing: -0.5px;
    display: flex;
`;
const HomeContainerText4 = styled.div`
    color: #E0650D;
    font-family: Mint Grotesk;
    font-size: 20px;
    font-style: normal;
    font-weight: 300;
    line-height: 26px;
    letter-spacing: -0.5px;
    text-decoration-line: underline;
    margin-left: 1rem;
`;

const HomeContainerText5 = styled.div`
    margin-top: 3rem;
    color: #0E150E;
    font-family: Azeret Mono;
    font-size: 14px;
    font-style: normal;
    line-height: 16px; 
    letter-spacing: 1.4px;
    text-transform: uppercase;
    border: 1px solid #E0E5E0;
    padding: 1rem;
    display: flex;
    width: fit-content;
    ${azeretMono.style}
`;

const HomeContainerText6 = styled.div`
    color: #E0650D;
    font-family: Azeret Mono;
    font-size: 14px;
    font-style: normal;
    line-height: 16px; 
    letter-spacing: 1.4px;
    text-transform: uppercase;
    text-decoration-line: underline;
    margin-left: 0.5rem;
    ${azeretMono.style}
`;

const BlogContainer = styled.div`
    display: flex;
    padding: 0rem 5rem;
    align-items: center;
    height: 50rem;
    border-radius: 80px 80px 0px 0px;
    background: #FDF6F1;
`;

const BlogContainerText1 = styled.div`
    margin-top: 2rem;
    font-family: Austin News Deck;
    font-size: 40px;
    font-style: normal;
    font-weight: 300;
    line-height: 50px;
`;

const CardsAnimationContainer = styled.div`
    display: flex;
    align-items: center;
    height: 50rem;
    border-radius: 80px 80px 0px 0px;
    background: #FFF;
`;

const CardsAnimationContainerText1 = styled.div`
    color: #000;
    font-family: Austin News Deck;
    font-size: 60px;
    font-style: normal;
    font-weight: 300;
    line-height: 80px; 
    letter-spacing: -3.2px;
    display: flex;
    align-items: center;
`;

const CardsAnimationContainerSelect = styled.select`
    border-radius: 15px;
    border: 3px solid #E0650D;
    width: 8rem;
    height: 3rem;
    color: #E0650D;
    font-family: 'Mint Grotesk';
    font-size: 20px;
    padding: 0rem 1rem;
    &:focus {
        outline: none;
        outline-color: #E0650D;
        outline-style: thin;
    }
`;

const CardsAnimationContainerText2 = styled.div`
    color: #4E564F;
    font-family: Austin News Deck;
    font-size: 30px;
    font-style: normal;
    font-weight: 300;
`;

const CardsAnimationSection = styled.div`
    height: 25rem;
    position: absolute;
    padding-top: 12rem;
    background-color: #FDF6F1;
    width: 96%;
    border-radius: 16px;
`;

const CardsAnimationContainerText3 = styled.div`
    color: #0E150E;
    font-family: Austin News Deck;
    font-size: 50px;
    font-style: normal;
    font-weight: 300;
    line-height: 64px;
    letter-spacing: -2.56px;
    margin-left: 100rem;
    margin-top: -8rem;
`;

const CardsAnimationContainerText4 = styled.div`
    color: #0E150E;
    font-family: Mint Grotesk;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 23px;
    letter-spacing: -0.18px;
    margin-left: 100rem;
    margin-top: 5rem;
`;

const CloudsAnimationContainer = styled.div`
    height: 36rem;
    border-radius: 16px;
    margin-top: 20rem;
    margin-left: 2rem;
    margin-right: 2rem;
    background-color: #F3FCFC;
    padding: 1rem;
`;

const CloudsAnimationContainerText1 = styled.div`
    color: #1B311C;
    font-family: Austin News Deck;
    font-size: 60px;
    font-style: normal;
    font-weight: 300;
    line-height: 64px;
    letter-spacing: -1.5px;
`;

const CloudsAnimationContainerText2 = styled.div`
    color: #1B311C;
    font-family: Mint Grotesk;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 23px;
    letter-spacing: -0.1px;
    margin-top: 7rem;
`;

const ChattingAnimationContainer = styled.div`
    margin-top: 2rem;
    margin-left: 2rem;
    margin-right: 2rem;
    padding-top: 2rem;
    background-color: #FCFDF1;
    border-radius: 16px;
    display: flex;
`;

const ChattingAnimationSection = styled.div`
    height: 35rem;
    background-color: #F5FEF6;
    border-top-right-radius: 16px;
    width: 60%;
    padding: 2rem 2rem 0rem 0rem;
`;

const ChattingAnimationImage = styled.div`
    background-image: url(/temp/ChattingAnimation_temp.png);
    height: 100%;
    background-repeat: no-repeat;
    background-size: 100% 100%;
`;

const ChattingAnimationText1 = styled.div`
    color: #0E150E;
    font-family: Austin News Deck;
    font-size: 60px;
    font-style: normal;
    font-weight: 300;
    line-height: 64px;
    letter-spacing: -2px;
    margin-left: 3rem;
    margin-top: 2rem;
`;

const ChattingAnimationText2 = styled.div`
    color: #0E150E;
    font-family: Mint Grotesk;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 23px;
    letter-spacing: -0.18px;
    margin-left: 3rem;
    margin-top: 7rem;
`;

const CashAnimationContainer = styled.div`
    background-color: #F0FFF7;
    margin-top: 2rem;
    margin-left: 2rem;
    margin-right: 2rem;
    border-radius: 16px;
    display: flex;
    justify-content: space-between;
`;

const CashAnimationText1 = styled.div`
    color: #0E150E;
    font-family: Austin News Deck;
    font-size: 60px;
    font-style: normal;
    font-weight: 300;
    line-height: 64px;
    letter-spacing: -2px;
    padding-left: 4rem;
    padding-top: 4rem;
`;

const CashAnimationText2 = styled.div`
    color: #0E150E;
    font-family: Mint Grotesk;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: -0.18px;
    padding-left: 4rem;
    margin-top: 10rem;
    margin-bottom: 4rem;
`;

const CashAnimationImage = styled.div`
    background-image: url(/temp/CashAnimation_temp.png);
    height: 100%;
    background-repeat: no-repeat;
    background-size: 100% 100%;
`;

const CashAnimationSection = styled.div`
    height: auto;
    background-color: #F5FEF6;
    border-top-right-radius: 16px;
    width: 55%;
`;

const GetMoreContainer = styled.div`
    margin-top: 4rem;
    padding: 4rem;
`;

const GetMoreContainerText1 = styled.div`
    color: #0E150E;
    font-family: Austin News Deck;
    font-size: 45px;
    font-style: normal;
    font-weight: 300;
    line-height: 48px;
    letter-spacing: -1.44px;
`;

const GetMoreBox = styled.div`
    border: 1px solid #CACFCA;
    border-radius: 16px;
    padding: 2rem 11rem 2rem 2rem;
`;

const XLetter = styled.div`
    color: #000;
    font-family: Mint Grotesk;
    font-size: 30px;
    font-style: normal;
    font-weight: 500;
    line-height: 100%;
    letter-spacing: -0.5px;
    display: inline-block;
`;

const GetMoreSubBox = styled.div`
    padding: 1rem;
    border-radius: 30.77px;
    border: 0.769px solid #1B311C;
    background: #FFF;
    box-shadow: -15.38483px 0px 0px 0px #1B311C;
`;

const GetMoreText = styled.div`
    margin-top: 6rem;
    color: #0E150E;
    font-family: Austin News Deck;
    font-size: 26px;
    font-style: normal;
    font-weight: 300;
    line-height: 30px; 
    letter-spacing: -0.8px;
`;

const Container = styled.div`
    margin-top: 4rem;
    border-color: gray;
    border-top: 1px solid;
    border-color: gray;
    border-top-left-radius: 80px;
    border-top-right-radius: 80px;
`;

const MortgageAnimationText1 = styled.div`
    color: #0E150E;
    font-family: Austin News Deck;
    font-size: 70px;
    font-style: normal;
    font-weight: 300;
    line-height: 80px;
    letter-spacing: -3.2px;
    display: flex;
    align-items: center;
`;

const MortgageAnimationText2 = styled.div`
    color: #4E564F;
    font-family: Austin News Deck;
    font-size: 45px;
    font-style: normal;
    font-weight: 300;
    line-height: 50px;
    letter-spacing: -2.56px;
`;

const MortgageAnimationContainer = styled.div`
    display: flex;
    margin: 2rem;
    padding: 4rem 2rem;
    background-color: #F1FEFE;
    border-radius: 16px;
`;

const MortgageAnimationSetion = styled.div`
    height: 30rem;
    width: 55%;
`;

const MortgageAnimationImage = styled.div`
    background-image: url(/temp/MortgageAnimation_temp.png);
    height: 100%;
    background-repeat: no-repeat;
    background-size: 100% 100%;
`;

const MortgageAnimationSectionText1 = styled.div`
    color: #0E150E;
    font-family: Austin News Deck;
    font-size: 50px;
    font-style: normal;
    font-weight: 300;
    line-height: 60px;
    letter-spacing: -2px;
    margin-left: 7rem;
`;

const MortgageAnimationSectionText2 = styled.div`
color: #0E150E;
    font-family: Mint Grotesk;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 23px;
    letter-spacing: -0.18px;
    margin-left: 7rem;
    margin-top: 8rem;
    `;

const DownPaymentAnimationContainer = styled.div`
    background-color: #F5FEF6;
    border-radius: 16px;
    padding-top: 2rem;
    padding-left: 2rem;
    margin: 2rem;
    display: flex;
    justify-content: center;
`;

const DownPaymentAnimationText1 = styled.div`
    color: #0E150E;
    font-family: Austin News Deck;
    font-size: 55px;
    font-style: normal;
    font-weight: 300;
    line-height: 50px;
    letter-spacing: -2px;
`;

const DownPaymentAnimationText2 = styled.div`
    color: #0E150E;
    font-family: Mint Grotesk;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: -0.18px;
    margin-top: 10rem;
`;

const DownPaymentAnimationSetion = styled.div`
    height: auto;
    width: 55%;
`;

const DownPaymentAnimationImage = styled.div`
    background-image: url(/temp/DownpaymentAnimation_temp.png);
    height: 100%;
    background-repeat: no-repeat;
    background-size: 100% 100%;
`;

const NoMoreRealtorFeesContainer = styled.div`
    background-color: #FDF6F1;
    border-radius: 16px;
    display: flex;
`;

const NoMoreRealtorFeesAnimationSetion = styled.div`
    height: auto;
    width: 55%;
`;

const NoMoreRealtorFeesAnimationImage = styled.div`
    background-image: url(/temp/NoMoreRealtorFeesAnimation_temp.png);
    height: 100%;
    background-repeat: no-repeat;
    background-size: 100% 100%;
`;

const NoMoreRealtorFeesText1 = styled.div`
    color: #0E150E;
    font-family: Austin News Deck;
    font-size: 55px;
    font-style: normal;
    font-weight: 300;
    line-height: 50px;
    letter-spacing: -2px;
    margin-top: 3rem;
    margin-left: 5rem;
`;

const NoMoreRealtorFeesText2 = styled.div`
    color: #0E150E;
    font-family: Mint Grotesk;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: -0.18px;
    margin-left: 5rem;
    margin-top: 6rem;
`;


const LandingAnimation = () => {
    const dispatch = useAppDispatch();
    const groups = useAppSelector((state) => state.groupsReducer.groups);
    const [selectedGroup, setSelectedGroup] = React.useState(groups[0]);
    const [up, setUp] = useState(false);
    useLayoutEffect(() => {
        let before = 0;
        let scrollUp = false;
        window.onscroll = () => {
            const scrolled = window.scrollY;

            if (before > scrolled) {
                before = scrolled;
                scrollUp = true;
                setUp(true)
            } else {
                setUp(false)
            }
        };
            ScrollTrigger.normalizeScroll(true)
            ScrollSmoother.create({
                smooth: 2,
                effects: true,
                normalizeScroll: true
            });
            ScrollTrigger.create({
                trigger: ".homeContainer",
                pin: true,
                start: "bottom bottom",
                end: "+=300",
                markers: false
            });

    }, []);


    useEffect(() => {
        if (groups && groups.length > 0) {
            setSelectedGroup(groups[0]);
        }
    }, [groups]);
// useEffect(() => {setTimeout(() => console.log(document.querySelector('.homeContainer')?.clientHeight()), 1000)}, [])
    useEffect(() => {
        if (selectedGroup) {
            dispatch(fetchOffersByBuyerGroupId(selectedGroup.group.id));
        }
    }, [selectedGroup, dispatch]);

    return (
        <div className='homeContainer'>
            <Navbar>
                <Image src={"/landing/logocolor.svg"} width={160} height={100} alt='logo' style={{ marginLeft: '3rem' }} />
                <NavLink>
                    <Link href={"#"}><NavbarText>How It Works</NavbarText></Link>
                    <Link href={"#"}><NavbarText>FAQ</NavbarText></Link>
                    <Link href={"#"}><NavbarText><PrimaryButton text='Get Started' style={{ height: '3rem' }} /></NavbarText></Link>
                </NavLink>
            </Navbar>

            <HomeContainer>
                <div>
                    <div>
                        <HomeContainerText1>
                            The new, best way to buy
                        </HomeContainerText1>
                        <HomeContainerText1 style={{ display: 'flex', alignItems: 'center' }}>
                            or sell&nbsp;<Image src={"/temp/HomeCloudAnimation_temp.png"} width={200} height={100} alt='home-cloud-animation' />&nbsp;a home. Period.
                        </HomeContainerText1>
                    </div>
                    <div>
                        <HomeContainerText2>
                            List your home, make an offer, or get a mortgage in minutes—no realtors necessary.
                        </HomeContainerText2>
                        <HomeContainerText3>
                            No more 6% fees, no more waiting on someone to get things done.
                            <HomeContainerText4><Link href="#">See how it works</Link></HomeContainerText4>
                        </HomeContainerText3>
                    </div>
                    <div>
                        {/* <AzeretMonoParagraph weight="regular"> */}
                        <HomeContainerText5>
                            NOW AVAILABLE IN ATALNTA <HomeContainerText6><Link href={"#"}>SEE LISTENGS</Link></HomeContainerText6>
                        </HomeContainerText5>
                        {/* </AzeretMonoParagraph> */}
                    </div>
                </div>
            </HomeContainer>

            <BlogContainer>
                <div className='container' style={{ width: '100%' }}>
                    <BlogAnimation />
                    {/* <div className='text-logo'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="61" height="73" viewBox="0 0 61 73" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M60.3261 21.7109L30.5009 0.948242L7.32606 17.0813L7.32606 7.79206L0.675781 7.79206V72.0127H60.3261V21.7109ZM7.32607 27.7105L30.5009 11.6988L53.6758 27.7105V29.17C50.7074 28.6783 47.5583 28.3831 44.2849 28.3831C35.0595 28.3831 28.6614 31.3477 22.9832 34.0449L22.7263 34.1669C17.6162 36.5949 13.1947 38.6957 7.32607 39.0201V27.7105ZM44.2849 35.0334C47.5599 35.0334 50.7149 35.37 53.6758 35.9222V49.7805C53.23 49.7919 52.7769 49.7978 52.3165 49.7978C45.6351 49.7978 40.8901 47.5433 35.3297 44.9013L35.0727 44.7793C31.9387 43.2906 28.5853 41.7204 24.6582 40.6122C24.8696 40.5119 25.0802 40.4117 25.29 40.3119L25.2912 40.3113L25.8365 40.0519C31.4008 37.4089 36.6466 35.0334 44.2849 35.0334ZM33.3236 51.3114C29.4285 52.4184 26.0975 53.9782 22.9832 55.4575L22.7263 55.5796C17.6162 58.0075 13.1947 60.1083 7.32607 60.4327V46.3504C9.38758 45.9803 11.5439 45.7678 13.7711 45.7678C21.4093 45.7678 26.6552 48.1433 32.2194 50.7863L33.3236 51.3114ZM17.7635 64.9824H53.6758V57.3348C50.7147 56.7826 47.5597 56.446 44.2849 56.446C36.6466 56.446 31.4008 58.8215 25.8365 61.4645L25.2912 61.7239C22.9276 62.8485 20.4668 64.0194 17.7635 64.9824Z" fill="#EE5605" />
                        </svg>
                    </div>
                    <BlogContainerText1 style={{ marginTop: '3rem' }}>
                        <div className="paragragh" dangerouslySetInnerHTML={{ __html: html }}></div>
                    </BlogContainerText1> */}
                </div>
            </BlogContainer>

            <CardsAnimationContainer>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ paddingLeft: '5rem' }}>
                        <CardsAnimationContainerText1>
                            Housewell is made for &nbsp;
                            <CardsAnimationContainerSelect>
                                <option value="sellers">Sellers</option>
                                <option value="buyers">Buyers</option>
                            </CardsAnimationContainerSelect>
                        </CardsAnimationContainerText1>

                        <CardsAnimationContainerText2>
                            <div className='endbox'>
                                Everything you need to sell your home,
                            </div>
                            <div>
                                no realtor required
                            </div>
                        </CardsAnimationContainerText2>
                    </div>

                    <div style={{ margin: '4rem 2rem', borderRadius: '16px', backgroundColor: '#FDF6F1' }}>
                        <CardsAnimationSection>
                            <div style={{ marginLeft: '-37rem' }}>
                                <CardsAnimation />

                                <CardsAnimationContainerText3>
                                    <div>
                                        List on every major
                                    </div>
                                    <div>
                                        real-estate marketplace,
                                    </div>
                                    <div>
                                        with no restrictions.
                                    </div>
                                </CardsAnimationContainerText3>

                                <CardsAnimationContainerText4>
                                    <div>
                                        In traditional real estate, 4 conversations need to
                                    </div>
                                    <div>
                                        happen whenever there’s a question. That kind of delay
                                    </div>
                                    <div>
                                        can make or break any real estate deal.
                                    </div>
                                </CardsAnimationContainerText4>
                                <PrimaryButton text='Get Started' style={{ height: '3rem', marginLeft: '100rem', marginTop: '5rem' }} />
                            </div>
                        </CardsAnimationSection>
                    </div>
                </div>
            </CardsAnimationContainer>

            <CloudsAnimationContainer>
                <div style={{ padding: "4rem" }}>
                    <CloudsAnimationContainerText1>
                        <div>
                            You still own your
                        </div>
                        <div>
                            home, you should own
                        </div>
                        <div>
                            your showings.
                        </div>
                    </CloudsAnimationContainerText1>
                    <CloudsAnimationContainerText2>
                        <div>
                            You have full control over who’s coming to see your
                        </div>
                        <div>
                            home and when—and when something comes up, no
                        </div>
                        <div>
                            more contacting a realtor to reschedule.
                        </div>
                    </CloudsAnimationContainerText2>
                    <PrimaryButton text='Get Started' style={{ height: '3rem', marginTop: '2rem' }} />
                </div>
                <div style={{ scale: "0.7", marginTop: "-44.5rem", width: "90rem", position: 'absolute', right: '-11.5rem' }}>
                    <CloudsAnimation />
                </div>
            </CloudsAnimationContainer>

            <ChattingAnimationContainer>
                <ChattingAnimationSection>
                    <ChattingAnimationImage />
                </ChattingAnimationSection>
                <div>
                    <ChattingAnimationText1>
                        <div>
                            Talk directly to buyers
                        </div>
                        <div>
                            or sellers—avoid
                        </div>
                        <div>
                            the realtor loop.
                        </div>
                    </ChattingAnimationText1>
                    <ChattingAnimationText2>
                        <div>
                            In traditional real estate, 4 conversations need to
                        </div>
                        <div>
                            happen whenever there’s a question. That kind of delay
                        </div>
                        <div>
                            can make or break any real estate deal.
                        </div>
                    </ChattingAnimationText2>
                    <PrimaryButton text='Get Started' style={{ height: '3rem', marginLeft: '3rem', marginTop: '3rem', marginBottom: '2rem' }} />
                </div>
            </ChattingAnimationContainer>

            <CashAnimationContainer>
                <div>
                    <CashAnimationText1>
                        <div>
                            Compare offers and
                        </div>
                        <div>
                            know you’re making
                        </div>
                        <div>
                            the best choice.
                        </div>
                    </CashAnimationText1>
                    <CashAnimationText2>
                        <div>
                            When evaluating offers, there are a lot of variables to
                        </div>
                        <div>
                            consider. Housewell helps you quickly see which offer is
                        </div>
                        <div>
                            recommended based on financing, timing, and how
                        </div>
                        <div>
                            much money ends up in your pocket.
                        </div>
                    </CashAnimationText2>
                    <PrimaryButton text='Get Started' style={{ height: '3rem', marginLeft: '4rem', marginTop: '4rem', marginBottom: '2rem' }} />
                </div>
                <CashAnimationSection>
                    <CashAnimationImage />
                </CashAnimationSection>
            </CashAnimationContainer>

            <GetMoreContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <GetMoreContainerText1>
                        <div>
                            Everything sellers need to
                        </div>
                        <div>
                            get more showings
                        </div>
                    </GetMoreContainerText1>
                    <PrimaryButton text='Get Started' style={{ height: '3rem' }} />
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <GetMoreBox>
                        <GetMoreSubBox>
                            <XLetter>X</XLetter>
                            <svg xmlns="http://www.w3.org/2000/svg" width="198" height="111" viewBox="0 0 198 111" fill="none">
                                <path d="M54.9242 1.15405C45.7845 43.0137 41.7988 58.7235 23.3829 97.3092C11.3391 122.544 22.6869 100.236 25.3512 92.4374C30.353 77.7955 32.8566 60.2682 25.693 45.941C17.2478 29.0506 -11.6165 41.6247 9.88085 51.112C22.9667 53.2485 36.1071 52.3503 49.0267 49.6163C114.153 30.7698 86.4607 -12.3077 77.2298 13.4619C73.9232 22.6928 59.0606 65.6691 62.9988 70.0012C67.2472 74.6743 101.37 44.4582 106.546 41.6247C112.3 38.4753 103.724 64.9584 110.692 60.7703C117.66 56.5822 128.127 44.4025 133.384 45.941C138.642 47.4795 135.308 60.7703 149.539 51.112C163.769 41.4538 171.847 60.7703 196.078 49.6163" stroke="#1B311C" stroke-width="2.30772" stroke-linecap="round" />
                            </svg>
                        </GetMoreSubBox>
                        <GetMoreText>
                            <div>
                                Ask a licensed realtor your
                            </div>
                            <div>
                                questions any day of the week
                            </div>
                        </GetMoreText>
                    </GetMoreBox>
                    <GetMoreBox>
                        <GetMoreSubBox>
                            <XLetter>X</XLetter>
                            <svg xmlns="http://www.w3.org/2000/svg" width="198" height="111" viewBox="0 0 198 111" fill="none">
                                <path d="M54.9242 1.15405C45.7845 43.0137 41.7988 58.7235 23.3829 97.3092C11.3391 122.544 22.6869 100.236 25.3512 92.4374C30.353 77.7955 32.8566 60.2682 25.693 45.941C17.2478 29.0506 -11.6165 41.6247 9.88085 51.112C22.9667 53.2485 36.1071 52.3503 49.0267 49.6163C114.153 30.7698 86.4607 -12.3077 77.2298 13.4619C73.9232 22.6928 59.0606 65.6691 62.9988 70.0012C67.2472 74.6743 101.37 44.4582 106.546 41.6247C112.3 38.4753 103.724 64.9584 110.692 60.7703C117.66 56.5822 128.127 44.4025 133.384 45.941C138.642 47.4795 135.308 60.7703 149.539 51.112C163.769 41.4538 171.847 60.7703 196.078 49.6163" stroke="#1B311C" stroke-width="2.30772" stroke-linecap="round" />
                            </svg>
                        </GetMoreSubBox>
                        <GetMoreText>
                            <div>
                                Get professional photos,
                            </div>
                            <div>
                                get more showings
                            </div>
                        </GetMoreText>
                    </GetMoreBox>
                    <GetMoreBox>
                        <GetMoreSubBox>
                            <XLetter>X</XLetter>
                            <svg xmlns="http://www.w3.org/2000/svg" width="198" height="111" viewBox="0 0 198 111" fill="none">
                                <path d="M54.9242 1.15405C45.7845 43.0137 41.7988 58.7235 23.3829 97.3092C11.3391 122.544 22.6869 100.236 25.3512 92.4374C30.353 77.7955 32.8566 60.2682 25.693 45.941C17.2478 29.0506 -11.6165 41.6247 9.88085 51.112C22.9667 53.2485 36.1071 52.3503 49.0267 49.6163C114.153 30.7698 86.4607 -12.3077 77.2298 13.4619C73.9232 22.6928 59.0606 65.6691 62.9988 70.0012C67.2472 74.6743 101.37 44.4582 106.546 41.6247C112.3 38.4753 103.724 64.9584 110.692 60.7703C117.66 56.5822 128.127 44.4025 133.384 45.941C138.642 47.4795 135.308 60.7703 149.539 51.112C163.769 41.4538 171.847 60.7703 196.078 49.6163" stroke="#1B311C" stroke-width="2.30772" stroke-linecap="round" />
                            </svg>
                        </GetMoreSubBox>
                        <GetMoreText>
                            <div>
                                Know who’s touring
                            </div>
                            <div>
                                your home—free criminal
                            </div>
                            <div>
                                background checks
                            </div>
                        </GetMoreText>
                    </GetMoreBox>
                </div>
            </GetMoreContainer>

            <Container>
                <div style={{ padding: '4rem' }}>
                    <MortgageAnimationText1>
                        Housewell is made for
                        &nbsp;
                        <CardsAnimationContainerSelect>
                            <option value="buyers">Buyers</option>
                            <option value="sellers">Sellers</option>
                        </CardsAnimationContainerSelect>
                    </MortgageAnimationText1>
                    <MortgageAnimationText2>
                        <div>
                            Everything you need to sell your home,
                        </div>
                        <div>
                            no realtor required
                        </div>
                    </MortgageAnimationText2>
                </div>

                <MortgageAnimationContainer>
                    <MortgageAnimationSetion>
                        <MortgageAnimationImage />
                    </MortgageAnimationSetion>

                    <div>
                        <MortgageAnimationSectionText1>
                            <div>
                                Get pre-approved
                            </div>
                            <div>
                                for a mortgage in 5
                            </div>
                            <div>
                                minutes or less
                            </div>
                        </MortgageAnimationSectionText1>
                        <MortgageAnimationSectionText2>
                            <div>
                                Apply 100% online and get pre-approved with
                            </div>
                            <div>
                                competitive rates in minutes—a pre-approval is a must
                            </div>
                            <div>
                                for many sellers. Receive a generous rebate at closing
                            </div>
                            <div>
                                (0.6% of the loan) with no origination fee.
                            </div>
                        </MortgageAnimationSectionText2>
                        <PrimaryButton text='Get Started' style={{ height: '3rem', marginLeft: "7rem", marginTop: '2rem' }} />
                    </div>
                </MortgageAnimationContainer>

                <DownPaymentAnimationContainer>
                    <div>
                        <DownPaymentAnimationText1>
                            <div>
                                Build your offer with
                            </div>
                            <div>
                                everything you need,
                            </div>
                            <div>
                                no realtor required
                            </div>
                        </DownPaymentAnimationText1>
                        <DownPaymentAnimationText2>
                            <div>
                                Submit an offer quickly in a simple step-by-step
                            </div>
                            <div>
                                experience—no need to be a realtor or to be an expert in
                            </div>
                            <div>
                                contract law. Every contract is formatted with all the
                            </div>
                            <div>
                                same legal requirements that a realtor uses.
                            </div>
                        </DownPaymentAnimationText2>
                        <PrimaryButton text='Get Started' style={{ height: '3rem', marginTop: '4rem', marginBottom: '2rem' }} />
                    </div>
                    <DownPaymentAnimationSetion>
                        <DownPaymentAnimationImage />
                    </DownPaymentAnimationSetion>
                </DownPaymentAnimationContainer>

                <NoMoreRealtorFeesContainer>
                    <NoMoreRealtorFeesAnimationSetion>
                        <NoMoreRealtorFeesAnimationImage />
                    </NoMoreRealtorFeesAnimationSetion>
                    <div>
                        <NoMoreRealtorFeesText1>
                            <div>
                                No more realtor
                            </div>
                            <div>
                                fees—save up to 5%
                            </div>
                            <div>
                                on closing costs
                            </div>
                        </NoMoreRealtorFeesText1>
                        <NoMoreRealtorFeesText2>
                            <div>
                                In traditional real estate, 4 conversations need to
                            </div>
                            <div>
                                happen whenever there’s a question. That kind of delay
                            </div>
                            <div>
                                can make or break any real estate deal.
                            </div>

                        </NoMoreRealtorFeesText2>
                        <PrimaryButton text='Get Started' style={{ height: '3rem', marginTop: '4rem', marginBottom: '4rem', marginLeft: '5rem' }} />
                    </div>
                </NoMoreRealtorFeesContainer>

                <GetMoreContainer>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <GetMoreContainerText1>
                            <div>
                                Experience how it should
                            </div>
                            <div>
                                be to buy a home
                            </div>
                        </GetMoreContainerText1>
                        <PrimaryButton text='Get Started' style={{ height: '3rem' }} />
                    </div>
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                        <GetMoreBox>
                            <GetMoreSubBox>
                                <XLetter>X</XLetter>
                                <svg xmlns="http://www.w3.org/2000/svg" width="198" height="111" viewBox="0 0 198 111" fill="none">
                                    <path d="M54.9242 1.15405C45.7845 43.0137 41.7988 58.7235 23.3829 97.3092C11.3391 122.544 22.6869 100.236 25.3512 92.4374C30.353 77.7955 32.8566 60.2682 25.693 45.941C17.2478 29.0506 -11.6165 41.6247 9.88085 51.112C22.9667 53.2485 36.1071 52.3503 49.0267 49.6163C114.153 30.7698 86.4607 -12.3077 77.2298 13.4619C73.9232 22.6928 59.0606 65.6691 62.9988 70.0012C67.2472 74.6743 101.37 44.4582 106.546 41.6247C112.3 38.4753 103.724 64.9584 110.692 60.7703C117.66 56.5822 128.127 44.4025 133.384 45.941C138.642 47.4795 135.308 60.7703 149.539 51.112C163.769 41.4538 171.847 60.7703 196.078 49.6163" stroke="#1B311C" stroke-width="2.30772" stroke-linecap="round" />
                                </svg>
                            </GetMoreSubBox>
                            <GetMoreText>
                                <div>
                                    Ask a licensed realtor your
                                </div>
                                <div>
                                    questions any day of the week
                                </div>
                            </GetMoreText>
                        </GetMoreBox>
                        <GetMoreBox>
                            <GetMoreSubBox>
                                <XLetter>X</XLetter>
                                <svg xmlns="http://www.w3.org/2000/svg" width="198" height="111" viewBox="0 0 198 111" fill="none">
                                    <path d="M54.9242 1.15405C45.7845 43.0137 41.7988 58.7235 23.3829 97.3092C11.3391 122.544 22.6869 100.236 25.3512 92.4374C30.353 77.7955 32.8566 60.2682 25.693 45.941C17.2478 29.0506 -11.6165 41.6247 9.88085 51.112C22.9667 53.2485 36.1071 52.3503 49.0267 49.6163C114.153 30.7698 86.4607 -12.3077 77.2298 13.4619C73.9232 22.6928 59.0606 65.6691 62.9988 70.0012C67.2472 74.6743 101.37 44.4582 106.546 41.6247C112.3 38.4753 103.724 64.9584 110.692 60.7703C117.66 56.5822 128.127 44.4025 133.384 45.941C138.642 47.4795 135.308 60.7703 149.539 51.112C163.769 41.4538 171.847 60.7703 196.078 49.6163" stroke="#1B311C" stroke-width="2.30772" stroke-linecap="round" />
                                </svg>
                            </GetMoreSubBox>
                            <GetMoreText>
                                <div>
                                    Sign documents online,
                                </div>
                                <div>
                                    no pen and paper needed
                                </div>
                            </GetMoreText>
                        </GetMoreBox>
                        <GetMoreBox>
                            <GetMoreSubBox>
                                <XLetter>X</XLetter>
                                <svg xmlns="http://www.w3.org/2000/svg" width="198" height="111" viewBox="0 0 198 111" fill="none">
                                    <path d="M54.9242 1.15405C45.7845 43.0137 41.7988 58.7235 23.3829 97.3092C11.3391 122.544 22.6869 100.236 25.3512 92.4374C30.353 77.7955 32.8566 60.2682 25.693 45.941C17.2478 29.0506 -11.6165 41.6247 9.88085 51.112C22.9667 53.2485 36.1071 52.3503 49.0267 49.6163C114.153 30.7698 86.4607 -12.3077 77.2298 13.4619C73.9232 22.6928 59.0606 65.6691 62.9988 70.0012C67.2472 74.6743 101.37 44.4582 106.546 41.6247C112.3 38.4753 103.724 64.9584 110.692 60.7703C117.66 56.5822 128.127 44.4025 133.384 45.941C138.642 47.4795 135.308 60.7703 149.539 51.112C163.769 41.4538 171.847 60.7703 196.078 49.6163" stroke="#1B311C" stroke-width="2.30772" stroke-linecap="round" />
                                </svg>
                            </GetMoreSubBox>
                            <GetMoreText>
                                <div>
                                    Never wait again—
                                </div>
                                <div>
                                    schedule tours immediately
                                </div>
                            </GetMoreText>
                        </GetMoreBox>
                    </div>
                </GetMoreContainer>
            </Container>
        </div>
    )
}

export default LandingAnimation;