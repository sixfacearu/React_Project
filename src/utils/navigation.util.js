//Please add an common utility methods here
import { Navigation } from 'react-native-navigation';

import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';

const NavigationUtil = {
  authenticationEntry: () => {
    return Navigation.setRoot({
      root: {
        stack: {
          id: stackName.AuthenticationStack,
          children: [
            {
              component: {
                name: screenId.ChooseDeposite,
              },

            },
          ],
          options: {
            topBar: {
              title: {
                text: 'Login'
              },
              drawBehind: false,
              visible: false,
              animate: false
            }
          }
        }
      }
    });
  },
  setBottomTabsForGoal: () => {
    return Navigation.setRoot({
      root: {
        bottomTabs: {
          id: stackName.HomeBottomTab,
          options: {
            bottomTabs: {
              currentTabIndex: 1,
              visible: true,
              animate: true,
              drawBehind: true,
              titleDisplayMode: 'alwaysHide'
            },
          },
          children: [
            {
              component: {
                name: screenId.LearnScreen,
                options: {
                  bottomTab: {
                    fontSize: 12,
                    text: '',
                    icon: require('../assets/nav_learn_icon_on.png'),// require('../assets/menu_learn_inactive.icon.png')
                    // selectedIcon: require('../assets/menu_learn_active.icon.png'),
                    iconColor: 'gray',
                    selectedIconColor: 'black',
                    textColor:'gray',
                    selectedTextColor:'black',
                    iconInsets : {top : 5, left : 0, bottom : -5, right : 0}
                  }
                }
              },
            },
            {
              stack: {
                id: stackName.GoalScreenStack,
                children: [
                  {
                    component: {
                      name: screenId.CreateGoalScreen,
                    }
                  },
                ],
                options: {
                  bottomTab: {
                    text: '',
                    fontSize: 12,
                    icon: require('../assets/nav_goal_icon.png'), // require('../assets/menu_dashboard.icon.png'),
                    iconColor: 'gray',
                    selectedIconColor: 'black',
                    textColor:'gray',
                    selectedTextColor:'black',
                    iconInsets : {top : 5, left : 0, bottom : -5, right : 0}
                  }
                }
              }
            },
            {
              stack: {
                id: stackName.MenuScreenStack,
                children: [
                  {
                    component: {
                      name: screenId.MenuScreen,
                    }
                  },
                ],
                options: {
                  bottomTab: {
                    text: '',
                    fontSize: 12,
                    icon: require('../assets/nav_menu_icon_on.png'), //require('../assets/menu_settings_inactive.icon.png'),
                    // selectedIcon: require('../assets/menu_settings_active.icon.png'),
                    iconColor: 'gray',
                    selectedIconColor: 'black',
                    textColor:'gray',
                    selectedTextColor:'black',
                    iconInsets : {top : 5, left : 0, bottom : -5, right : 0}
                  }
                }
              }
            }, // Tab 3
            // {
            //   component: {
            //     name: screenId.MenuScreen,
            //     options: {
            //       bottomTab: {
            //         text: '',
            //         fontSize: 12,
            //         icon: require('../assets/nav_menu_icon_on.png'), //require('../assets/menu_settings_inactive.icon.png'),
            //         // selectedIcon: require('../assets/menu_settings_active.icon.png'),
            //         iconColor: 'gray',
            //         selectedIconColor: 'black',
            //         textColor:'gray',
            //         selectedTextColor:'black',
            //         iconInsets : {top : 5, left : 0, bottom : -5, right : 0}
            //       }
            //     }
            //   },
            // }, //tab 3
          ],
        }
      }
    });
  },
  
  setDynamicBottomTabsForGoal: (goalScreenStackScreenId,propData) => {
    return Navigation.setRoot({
      root: {
        bottomTabs: {
          id: stackName.HomeBottomTab,
          options: {
            bottomTabs: {
              currentTabIndex: 1,
              visible: true,
              animate: true,
              drawBehind: true,
              titleDisplayMode: 'alwaysHide'
            },
          },
          children: [
            {
              component: {
                name: screenId.LearnScreen,
                options: {
                  bottomTab: {
                    fontSize: 12,
                    text: '',
                    icon: require('../assets/nav_learn_icon_on.png'),// require('../assets/menu_learn_inactive.icon.png')
                    // selectedIcon: require('../assets/menu_learn_active.icon.png'),
                    iconColor: 'gray',
                    selectedIconColor: 'black',
                    textColor:'gray',
                    selectedTextColor:'black',
                    iconInsets : {top : 5, left : 0, bottom : -5, right : 0}
                  }
                }
              },
            },
            {
              stack: {
                id: stackName.GoalScreenStack,
                children: [
                  {
                    component: {
                      name: goalScreenStackScreenId,
                      passProps: {
                        goalInfoData: propData
                      }
                    }
                  },
                ],
                options: {
                  bottomTab: {
                    text: '',
                    fontSize: 12,
                    icon: require('../assets/nav_goal_icon.png'), // require('../assets/menu_dashboard.icon.png'),
                    iconColor: 'gray',
                    selectedIconColor: 'black',
                    textColor:'gray',
                    selectedTextColor:'black',
                    iconInsets : {top : 5, left : 0, bottom : -5, right : 0}
                  }
                }
              }
            },
            {
              stack: {
                id: stackName.MenuScreenStack,
                children: [
                  {
                    component: {
                      name: screenId.MenuScreen,
                    }
                  },
                ],
                options: {
                  bottomTab: {
                    text: '',
                    fontSize: 12,
                    icon: require('../assets/nav_menu_icon_on.png'), //require('../assets/menu_settings_inactive.icon.png'),
                    // selectedIcon: require('../assets/menu_settings_active.icon.png'),
                    iconColor: 'gray',
                    selectedIconColor: 'black',
                    textColor:'gray',
                    selectedTextColor:'black',
                    iconInsets : {top : 5, left : 0, bottom : -5, right : 0}
                  }
                }
              }
            }
          ]
        }
      }
    });
  },
  setDefaultOptions: () => {
    return Navigation.setDefaultOptions({
      topBar: {
        visible: false,
        drawBehind: true,
        animate: false
      },
      layout: {
        orientation: 'portrait'
      }
    });
  }
}

export default NavigationUtil;