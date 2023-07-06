import React, { FC, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FeatureCollection, GeometryObject } from 'geojson';


interface IInteractiveMap {
    countryName: string;
}

const InteractiveMap:FC<IInteractiveMap> = ({
    countryName
}) => {

    const svgRef = useRef<SVGSVGElement>(null);
    
    const [countryGeoJSON, setCountryGeoJSON] = useState<FeatureCollection<GeometryObject>>();
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [selectionName, setSelectionName] = useState<string>('')

    const fetchGeoJson = (geoJsonFilepath: string, level: number) => {
        // if( level === -1 || level === 0 || level === 1 ) { // if asking for country, or within country i.e. province or withing province i.e. district
        //     filePath = geoJsonFilepath
        // } else if ( level === 2 ) { // if asking for withing district

        // }
        fetch(geoJsonFilepath)
                .then((response:any) => {
                    console.log(response)
                    if( response.ok ) { return response.json(); }
                    throw response;
                })
                .then((data)=>{ setCountryGeoJSON(data); })
                .catch((error)=>{ console.error("Error fetching data: ", error); })
                .finally(()=>{ })
    }

    // fetching geojson of nepal country having coordinates of all 6 provinces
    useEffect(()=>{
        fetchGeoJson(`/assets/geojson/countries/${countryName}/countries.geojson`, -1)
    },[])

    useEffect(() => {
        if( !countryGeoJSON ) { return }
        if( Object.keys(countryGeoJSON).length < 1 ) { return }
        
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
      
            // Your D3.js code to parse and render the GeoJSON data goes here
            const projection = d3.geoMercator().fitSize([800, 600], countryGeoJSON);
            const path = d3.geoPath().projection(projection);

            svg.selectAll('*').remove(); // Clear previous content of SVG

            // SVG map
            svg
                .selectAll('path')
                .data(countryGeoJSON.features)
                .enter()
                .append('path')
                .attr('d', (d: any) => path(d))
                .attr('fill', 'steelblue')
                .attr('stroke', 'white')
                .attr('name', (d: any) => d.properties.DISTRICT || d.properties.FIRST_GaPa)
                .on('click', handleProvinceClick)
                .on('mouseover', handleMouseOver)
                .on('mouseout', handleMouseOut);

            // label
            svg
                .selectAll('text')
                .data(countryGeoJSON.features)
                .enter()
                .append('text')
                .attr('x', (d: any) => path.centroid(d)[0])
                .attr('y', (d: any) => path.centroid(d)[1])
                .text((d: any) => d.properties.DISTRICT || d.properties.FIRST_GaPa )
                .attr('text-anchor', 'middle')
                .attr('fill', 'black')
                .style('font-size', '10px')
                .style('pointer-events', 'none');

        }

    }, [countryGeoJSON]);

    const handleMouseOver = (event: any, d: any) => {
        d3.select(event.currentTarget).attr('fill', 'orange');
        // tooltip
        // d3.select(svgRef.current)
        //     .append('foreignObject') // Use foreignObject to append HTML content
        //     .attr('x', event.pageX)
        //     .attr('y', event.pageY)
        //     .attr('width', 200)
        //     .attr('height', 100)
        //     .append('xhtml:div')
        //     .style('position', 'relative')
        //     .style('background-color', 'rgba(0, 0, 0, 0.8)')
        //     .style('color', 'white')
        //     .style('padding', '8px')
        //     .style('border-radius', '4px')
        //     .html(`${d?.properties?.DISTRICT || d?.properties?.FIRST_GaPa || ''}`);
    };

    const handleMouseOut = (event: any, d: any) => {
        d3.select(event.currentTarget).attr('fill', 'steelblue');
        d3.select(svgRef.current).select('div').remove();
    };

    const handleProvinceClick = (event: any, d: any) => {
        // /assets/geojson/countries/nepal/province/Province1.json
        console.log({event, d})

        let geoJsonFilePath = `/assets/geojson/countries/${countryName}/countries.geojson`;

        if( d.properties.Level === 0 ) { // clicking on child of country
            geoJsonFilePath = `/assets/geojson/countries/${countryName}/province/${d.properties.TARGET}.json`;
        } else if( d.properties.Level === 1 ) { // clicking on child of province
            geoJsonFilePath = `/assets/geojson/countries/${countryName}/district/${d.properties.TARGET}.json`;
        } else if( d.properties.Level === 2 ) { // clicking on child of district
            geoJsonFilePath = `/assets/geojson/countries/${countryName}/district/${d.properties.TARGET}.json`;
        }

        fetchGeoJson(geoJsonFilePath, d.properties.Level)

    };
    
    // console.log({countryGeoJSON})

    return (
        <>
            <svg ref={svgRef} width="800" height="600">
                {/* Additional SVG elements for your map */}
            </svg>
        </>
    )
}

export default InteractiveMap;