import React, { createContext, use, useReducer } from 'react';
import { courseData } from 'data/elearning/courseData';
import { courseReducer } from 'reducers/courseReducer';

export const CourseContext = createContext({ courses: [], primaryCourses: [] });

const CourseProvider = ({ children }) => {
  const initData = {
    initCourses: courseData,
    courses: courseData,
    primaryCourses: courseData,
    cartItems: [{ ...courseData[1] }, { ...courseData[2] }],
    favouriteItems: []
  };
  const [coursesState, coursesDispatch] = useReducer(courseReducer, initData);

  const isInCart = id =>
    !!coursesState.cartItems.find(cartItem => cartItem.id === id);
  const isInFavouriteItems = id =>
    !!coursesState.favouriteItems.find(
      favouriteItem => favouriteItem.id === id
    );

  return (
    <CourseContext
      value={{
        coursesState,
        coursesDispatch,
        isInCart,
        isInFavouriteItems
      }}
    >
      {children}
    </CourseContext>
  );
};

export const useCourseContext = () => use(CourseContext);

export default CourseProvider;
