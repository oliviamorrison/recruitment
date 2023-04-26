import { useState, useEffect } from "react";
import { getTeam } from "../api/routes/businessRoutes"
import { updateUserPermissions } from "../api/routes/userRoutes";
import "../styles/Application.css"
import { Nav } from "../components/Nav";
import { getSavedBusinessId } from "../authorisation/session.js";
import AuthService from "../authorisation/auth"

interface User {
  _id: string | undefined,
  name: string | undefined,
  permissions: string| undefined
}

export const TeamRoute = () => {
  const [userData, setUserData] = useState<User[]>([]);
  const [userToUpdate, setUserToUpdate] = useState<User>({
    _id: undefined,
    name: undefined,
    permissions: undefined
  });
  const token = AuthService.getToken();
  const businessId = getSavedBusinessId();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getTeam(businessId, token!);

        if (!response.ok) {
          throw new Error(
            "Error when getting team information."
          );
        }

        const users = await response.json();
        setUserData(users);
      } catch (err) {
        console.error(err);
      }
      };
      fetchUsers();
  }, [businessId, token, userData.length]);

const updateUser = async () => {
  try {
    const permissions = {
      permissions: userToUpdate.permissions
    }
    const response = await updateUserPermissions(userToUpdate._id!, permissions, token!)

    if (!response.ok) {
      throw new Error(
        "Error when updating user permissions"
      );
    }

    //reset user
    setUserToUpdate({
      _id: undefined,
      name: undefined,
      permissions: undefined
    })
  } catch (err) {
    console.error(err);
  }
}
  
  return (
    <div className="application">
        <Nav/>
        <div className="current-tab">
          <div className="tab-content">
              <h1>Team</h1>
              { userData.map((user: any) => {
                return (
                  <div key={user._id} className="team-row">
                    <div className="team-col" style={{display: "flex"}}>
                      <p className="team-name">{(user.name).toUpperCase()}</p>
                      <p>{user.permissions}</p>
                    </div>
                    <button className="team-col team-button" onClick={() => setUserToUpdate(user)}>Update Permissions</button>
                  </div>
                )
              })}
          </div>
        {
          userToUpdate._id !== undefined && (
              <form className="team-update-modal">
                <label htmlFor={userToUpdate.permissions} style={{padding: "10px"}}>Choose permission:</label>
                  <select 
                    value={userToUpdate.permissions} 
                    onChange={e => setUserToUpdate({...userToUpdate, permissions: e.target.value})}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="APPROVER">Appover</option>
                    <option value="SUBMITTER">Submitter</option>
                    <option value="NONE">None</option>
                  </select>
                <button className="team-update-button" type="submit" onClick={() => updateUser()}>Update</button>
              </form>
          )
        }
      </div>
    </div>
  );
}