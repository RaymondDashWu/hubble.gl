import { point } from '@turf/helpers';
import transformTranslate from '@turf/transform-translate';

/**
 * Parses camera type and creates keyframe for Hubble to use
 * @param {strCameraType} str of user-selected camera option ex: "Orbit 90"
 * @param {viewState} Hubble keyframe JSON that contains long, lat, zoom, bearing, pitch
 * @returns {JSON} below:
 *      {
 *        longitude: modifiedViewState.longitude,
 *        latitude: modifiedViewState.latitude,
 *        zoom: modifiedViewState.zoom,
 *        bearing: modifiedViewState.bearing,
 *        pitch: modifiedViewState.pitch
 *      }
 * 
 */
export function parseSetCameraType(strCameraType, viewState) {
    // Returns arr of important keywords. Should work for 2+ words in future ex: ["Orbit", "90"] | ["North", "South"] | ["Zoom", "In"]
    const match = strCameraType.match(/\b(?!to)\b\S+\w/g) 

    // Converts mapState object to turf friendly Point obj (GEOJSON)
    const turfPoint = point([viewState.longitude, viewState.latitude])
    if (match[0] == "Orbit") {
        viewState.bearing = parseInt(match[1])
    }

    // TODO future option that'll allow user to set X distance (km OR miles) directionally. Options inside turf
    // https://turfjs.org/docs/#transformTranslate
    const setChecker = new Set(["East", "South", "West", "North"])
    if (setChecker.has(match[0])) {
      if (match[0] == "East") { // TODO Temporary solution to catch this branch to master. Doesn't work for "East to North" for example if option allows in future
        const translatedPoly = transformTranslate(turfPoint, 10000, 270);
        viewState.longitude = translatedPoly.geometry.coordinates[0]
      } else 
      if (match[0] == "South") {
        const translatedPoly = transformTranslate(turfPoint, 10000, 0);
        viewState.latitude = translatedPoly.geometry.coordinates[1]
      } else 
      if (match[0] == "West") {
        const translatedPoly = transformTranslate(turfPoint, 10000, 90);
        viewState.longitude = translatedPoly.geometry.coordinates[0]
      } else 
      if (match[0] == "North") {
        const translatedPoly = transformTranslate(turfPoint, 10000, 180);
        viewState.latitude = translatedPoly.geometry.coordinates[1]
      }
    }

    if (match[0] == "Zoom") {
      if (match[1] == "In") {
        viewState.zoom = 15
      } else 
      if (match[1] == "Out") {
        viewState.zoom = 15
      } 
    }
    return viewState
  }