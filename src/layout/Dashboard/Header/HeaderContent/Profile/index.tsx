// material-ui
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import Avatar from 'components/@extended/Avatar';
import useAuth from 'hooks/useAuth';
import useAvatarUrl from 'hooks/useAvatarUrl';

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function Profile() {
  const { user } = useAuth();
  const avatarUrl = useAvatarUrl(user?.id || null, user?.avatarFileId || null);

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={(theme) => ({
          p: 0.25,
          bgcolor: 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: 'secondary.lighter' },
          '&:focus-visible': { outline: `2px solid ${theme.palette.secondary.dark}`, outlineOffset: 2 },
          ...theme.applyStyles('dark', { bgcolor: 'transparent' })
        })}
        aria-label="profile"
      >
        <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center', p: 0.5 }}>
          <Avatar alt="profile user" src={avatarUrl ?? undefined} size="sm" color="primary">
            {(user?.name || 'U').charAt(0)}
          </Avatar>
          <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
            {user?.name || 'Usuário'}
          </Typography>
        </Stack>
      </ButtonBase>
    </Box>
  );
}
