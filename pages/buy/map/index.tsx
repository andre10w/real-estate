import React, {useEffect} from 'react'
import styled from '@emotion/styled';
import { colors } from '../../../src/styles/colors';
import PropertyBox, { MapProperty } from '../../../src/components/boxes/properties/SidebarPropertyBox';
import { useDevice } from "../../../src/contexts/DeviceContext";
import PropertyViewMap from '../../../src/components/map/PropertyViewMap';
import { GeoJSONProperty } from '../../../src/components/map/PropertyViewMap';
import { H5, MintParagraph } from '../../../src/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '../../../src/store';
import {fetchMapProperties} from "../../../src/slices/properties";
import { BasicProperty } from '../../../src/models/basicProperty';
import Image from 'next/image';

type ResponsiveProps = {
    isMidsize?: boolean
	isMobile?: boolean
}
const OverallParentContainer = styled.div`
  	display: flex;
  	align-items: flex-start;
    justify-content: flex-start;
	position: relative;
`
const SidebarContainer = styled.div<ResponsiveProps>`
	display: grid;
	grid-template-columns: ${props => props.isMidsize ? '1fr' : '1fr 1fr'};
	grid-auto-rows: auto;
	grid-gap: 20px;
	padding: 10px;
	overflow-y: auto;
	align-content: start;
	height: ${props => props.isMobile ? "calc(100vh - 61px)" : "calc(100vh - 93px)"};
	max-width: ${props => (props.isMidsize && !props.isMobile) ? '500px' : '750px'};
	width: ${props => props.isMobile ? '100%' : 'auto'};
	box-sizing: border-box;
`
const MapContainer = styled.div<ResponsiveProps>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	height: ${props => props.isMobile ? "calc(100vh - 61px)" : "calc(100vh - 93px)"};
	flex-grow: 1; // grow to take up remaining space
    background-color: ${colors.gray400};
`

const ListButton = styled.button`
    position: fixed;
    top: 70px;
    border-radius: 24px;
	left: 50%;
	transform: translateX(-50%);
    border: 1px solid ${colors.gray300};
    background-color: white;
    display: inline-flex;
    z-index: 1;
    padding: 8px 14px;
    align-items: center;
    box-shadow: 0px 0px 0px 0px rgba(179, 185, 179, 0.08), 0px 3px 7px 0px rgba(179, 185, 179, 0.08), 0px 13px 13px 0px rgba(179, 185, 179, 0.07), 0px 29px 17px 0px rgba(179, 185, 179, 0.04), 0px 51px 20px 0px rgba(179, 185, 179, 0.01), 0px 80px 22px 0px rgba(179, 185, 179, 0.00);

    &:hover {
        cursor: pointer;
        background-color: ${colors.gray100};
    }
    &:active {
        background-color: ${colors.gray200};
    }

`;


// List of random street addresses
const addresses = [
  	'123 Maple Street',
	'456 Oak Avenue',
	'789 Pine Lane',
	'159 Elm Road',
	'753 Willow Drive',
	'357 Chestnut Place',
	'951 Poplar Way',
	'852 Birch Boulevard',
	'159 Spruce Parkway',
	'357 Cedar Street',
	'456 Fir Avenue',
	'753 Aspen Lane',
	'951 Beech Road',
	'852 Mahogany Drive',
	'123 Teak Place',
	'357 Redwood Way',
	'159 Sycamore Boulevard',
	'456 Cherry Parkway',
	'753 Peach Street',
	'159 Plum Avenue',
];

const convertToGeoJSON = (basicProperties: BasicProperty[]): GeoJSONProperty[] => {
	return basicProperties.map((property) => ({
	  type: "Feature",
	  id: property.id,
	  geometry: {
		type: "Point",
		coordinates: [property.longitude ?? 0, property.latitude ?? 0],
	  },
	  properties: {
		id: property.id,
		hover: false,
		streetAddress: property.streetAddress,
		address2: property.address2,
		imageUrl: property.coverImage || 'https://dyqpd3w9nj7ap.cloudfront.net/static-web-assets/website/landing/landing_background_desktop.png',
		city: property.city,
		bathrooms: property.bathroomCount,
		bedrooms: property.bedroomCount,
		squareFeet: property.squareFeet,
		country: "United States",
		state: property.state,
		price: `$${Math.round(property.listPrice / 1000)}k`,
		listPrice: property.listPrice,
		zip: property.zip,
	  }
	}));
  };
  

const BuyView = () => {
	const propertiesReducer = useAppSelector((state) => state.propertiesReducer);
    const properties = propertiesReducer.mapProperties;
    const dispatch = useAppDispatch();
	const geoJSONProperties = convertToGeoJSON(properties);
	const [showMap, setShowMap] = React.useState(true);

    useEffect(() => {
        dispatch(fetchMapProperties());
    }, [dispatch]);


	const { windowSize, isMobile } = useDevice();
    const isMidsize = (windowSize.width <= 1340);

    return (
      	<OverallParentContainer>

			{(!isMobile || showMap) && <MapContainer isMobile={isMobile}><PropertyViewMap properties={geoJSONProperties}></PropertyViewMap></MapContainer>}
			{(!isMobile || !showMap) && <SidebarContainer isMidsize={isMidsize} isMobile={isMobile}>
				<H5>Properties</H5>
				<div></div>
				{
					geoJSONProperties.slice(0, 20).map((property, index: number) => (
						<PropertyBox key={index} {...property.properties} />
					))
				}
			</SidebarContainer>}
			{isMobile && <ListButton onClick={() => setShowMap(!showMap)}>
                <Image src="/icon_svg/list.svg" alt='list' width={24} height={24} />
                <MintParagraph size="14" weight="medium" style={{color:colors.gray1000, marginLeft:'12px'}}>{showMap ? 'Toggle Listings' : 'Toggle Map'}</MintParagraph>
            </ListButton>}
      	</OverallParentContainer>
    )
}
  
export default BuyView;
