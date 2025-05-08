// src/lib/circles.js
import  supabase        from '../supabaseClient';

export const CircleService = {
  createCircle: ({ name, state, city, zip, type, icon }) =>
    supabase.rpc('create_circle', { _name: name, _state: state, _city: city, _zip: zip, _type: type, _icon: icon }),

  requestJoin: (circleId) =>
    supabase.rpc('request_circle_join', { _circle_id: circleId }),

  manageMember: ({ circleId, userId, status, role }) =>
    supabase.rpc('manage_circle_member', { _circle_id: circleId, _user_id: userId, _status: status, _role: role }),

  getMyCircles: (userId) =>
    supabase.rpc('get_user_circles', { _user_id: userId }),

  getMembers: (circleId) =>
    supabase.rpc('get_circle_members', { _circle_id: circleId }),

  getCircle: (circleId) =>
        supabase
          .from('circles')
          .select('*')
          .eq('id', circleId)
          .single(),
};
