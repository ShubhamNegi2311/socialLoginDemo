import {
  GoogleSignin,
  User,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginButton,
  LoginManager,
} from 'react-native-fbsdk-next';

type Props = {};

const App = (props: Props) => {
  const initalState: User = {
    user: {
      id: '',
      name: null,
      email: '',
      photo: null,
      familyName: null,
      givenName: null,
    },
    idToken: null,
    serverAuthCode: null,
  };
  const [user, setUser] = useState<User>(initalState);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '1084810778064-dje2eape42qjismts7dd4jvufl682tuk.apps.googleusercontent.com',
      iosClientId:
        '1084810778064-beodnefl1okc9lj6dpvbln1aojp9g20u.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
      setUser(userInfo);
    } catch (error) {
      console.log('Message', error.message);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User Cancelled the Login Flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Signing In');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play Services Not Available or Outdated');
      } else {
        console.log('Some Other Error Happened');
      }
    }
  };
  const isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (!!isSignedIn) {
      getCurrentUserInfo();
    } else {
      console.log('Please Login');
    }
  };
  const getCurrentUserInfo = async () => {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      setUser(userInfo);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        Alert.alert('User has not signed in yet');
        console.log('User has not signed in yet');
      } else {
        Alert.alert("Something went wrong. Unable to get user's info");
        console.log("Something went wrong. Unable to get user's info");
      }
    }
  };
  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setUser(initalState); // Remember to remove the user from your app's state as well
    } catch (error) {
      console.error(error);
    }
  };

  // const infoRequest = new GraphRequest(
  //   '/me',
  //   {
  //     parameters: {
  //       fields: {
  //         string: 'email,name',
  //       },
  //     },
  //   },
  //   (err, res) => {
  //     console.log(err, res);
  //   },
  // );

  const initUser = (token: string) => {
    fetch(
      'https://graph.facebook.com/v2.5/me?fields=email,name,friends&access_token=' +
        token,
    )
      .then(response => response.json())
      .then(json => {
        // Some user object has been set up somewhere, build that user here
        console.log('FACEBOOK_DATA ===>', JSON.stringify(json));
      })
      .catch(() => {
        console.log('ERROR GETTING DATA FROM FACEBOOK');
      });
  };

  return (
    <View style={styles.main}>
      {!user.idToken ? (
        <TouchableOpacity onPress={signIn}>
          <Text>Google Sign In</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={signOut}>
          <Text>Google Sign Out</Text>
        </TouchableOpacity>
      )}
      <View style={{height: 100}} />

      <LoginButton
        onLoginFinished={(error, result) => {
          if (error) {
            console.log('login has error: ' + result.error);
          } else if (result.isCancelled) {
            console.log('login is cancelled.');
          } else {
            AccessToken.getCurrentAccessToken().then(data => {
              console.log(data.accessToken.toString());
              initUser(data?.accessToken?.toString());
            });
          }
        }}
        onLogoutFinished={() => console.log('logout.')}
      />
      <View style={{height: 100}} />
      <TouchableOpacity
        onPress={() => {
          // LoginManager.logInWithPermissions(['public_profile']).then(
          //   function (result) {
          //     if (result.isCancelled) {
          //       console.log('Login cancelled');
          //     } else {
          //       console.log(
          //         'Login success with permissions: ' +
          //           result.grantedPermissions.toString(),
          //       );

          //       const currentProfile = Profile.getCurrentProfile().then(
          //         function (currentProfile) {
          //           if (currentProfile) {
          //             console.log(
          //               'The current logged user is: ' +
          //                 currentProfile.name +
          //                 '. His profile id is: ' +
          //                 currentProfile.userID,
          //             );
          //           }
          //         },
          //       );

          //       console.log(
          //         'PUBLIC_PROFILE ==>',
          //         JSON.stringify(currentProfile),
          //       );

          //       // new GraphRequestManager().addRequest(infoRequest).start();
          //     }
          //   },
          //   function (error) {
          //     console.log('Login fail with error: ' + error);
          //   },
          // );

          LoginManager.logInWithPermissions(['public_profile']).then(result => {
            if (result.isCancelled) {
              console.log('Login cancelled');
            } else {
              AccessToken.getCurrentAccessToken()
                .then(user => {
                  console.log(
                    'Facebook accessToken:\n' +
                      user.accessToken +
                      '\n\naccessTokenSource: ' +
                      user.accessTokenSource +
                      '\n\nuserID: ' +
                      user.userID,
                  );
                  console.log(user);
                  return user;
                })
                .then(user => {
                  const responseInfoCallback = (error, result) => {
                    if (error) {
                      console.log(error);
                      console.log('Error fetching data: ' + error.toString());
                    } else {
                      console.log(result);
                      console.log(
                        'id: ' +
                          result.id +
                          '\n\nname: ' +
                          result.name +
                          '\n\nfirst_name: ' +
                          result.first_name +
                          '\n\nlast_name: ' +
                          result.last_name +
                          '\n\nemail: ' +
                          result.email,
                      );
                    }
                  };

                  const infoRequest = new GraphRequest(
                    '/me',
                    {
                      accessToken: user.accessToken,
                      parameters: {
                        fields: {
                          string: 'email,name,first_name,last_name',
                        },
                      },
                    },
                    responseInfoCallback,
                  );

                  // Start the graph request.
                  new GraphRequestManager().addRequest(infoRequest).start();
                });
            }
          });
        }}>
        <Text>Facebook Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
